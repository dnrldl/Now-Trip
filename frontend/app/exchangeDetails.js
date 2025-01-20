import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchExchangeHistory } from '../api/exchangeRate';
import { useLocalSearchParams } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

// 탭 버튼 데이터
const tabs = [
  { label: '1주', filter: 'weekly' },
  { label: '3달', filter: 'monthly' },
  { label: '1년', filter: 'yearly' },
  { label: '전체', filter: 'all' },
];

export default function ExchangeDetailsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('1주');
  const [data, setData] = useState([]);
  const [latestData, setLatestData] = useState(0);
  const [labels, setLabels] = useState([]);
  const { currency } = useLocalSearchParams();

  const fetchData = async (currency, filter) => {
    try {
      setIsLoading(true);
      const response = await fetchExchangeHistory(currency, filter);
      const rates = response.map((item) => item.exchangeRate);
      const dates = response.map((item) => item.lastUpdated);

      setLatestData(rates.at(-1));

      setData(processDataForFilter(rates, filter));

      const labelCount = dates.length;
      if (labelCount > 3) {
        const mid1 = dates[Math.floor(labelCount / 4)];
        const mid2 = dates[Math.floor((labelCount / 4) * 3)];
        const newLabels = ['', mid1, mid2, ''];
        setLabels(newLabels);
      } else {
        setLabels(dates); // 데이터가 너무 적으면 모든 라벨 표시
      }
    } catch (error) {
      console.log('데이터 가져오기 실패: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processDataForFilter = (rates, filter) => {
    if (filter === 'weekly') return rates;
    const smoothedData = smoothData(rates);
    const interval = filter === 'monthly' ? 10 : 30;
    return groupDataByInterval(smoothedData, interval);
  };

  // 데이터를 스무딩 처리하는 함수 (이동 평균)
  const smoothData = useCallback((data, smoothingFactor = 5) => {
    if (data.length <= smoothingFactor) return data;

    return data.map((_, index, array) => {
      const start = Math.max(0, index - Math.floor(smoothingFactor / 2));
      const end = Math.min(
        array.length,
        index + Math.ceil(smoothingFactor / 2)
      );
      const subset = array.slice(start, end);
      return subset.reduce((sum, value) => sum + value, 0) / subset.length;
    });
  }, []);

  // 데이터를 30일 간격으로 그룹화하는 함수
  const groupDataByInterval = useCallback((data, interval = 30) => {
    const groupedData = [];
    for (let i = 0; i < data.length; i += interval) {
      const subset = data.slice(i, i + interval);
      const average =
        subset.reduce((sum, value) => sum + value, 0) / subset.length;
      groupedData.push(average);
    }
    return groupedData;
  }, []);

  useEffect(() => {
    const initialFilter = tabs.find((tab) => tab.label === selectedTab).filter;
    fetchData(currency, initialFilter);
  }, [selectedTab]);

  return (
    <View style={styles.container}>
      {/* 상단 정보 */}
      <View style={styles.header}>
        <Text style={styles.title}>{currency}</Text>
        <Text style={styles.currencyValue}>{latestData}원</Text>
        <Text style={styles.subtext}>1월 17일보다 -33,000원 (7.8%)</Text>
      </View>

      {/* 그래프 */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color='#0000ff' />
          <Text>게시글을 불러오는 중입니다...</Text>
        </View> // <Text>Loading</Text>
      ) : (
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data,
                color: () => '#007BFF', // 라인 색상
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 40} // 화면 너비 조정
          height={360}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: () => '#007BFF',
            labelColor: () => '#555555',
            decimalPlaces: 1, // 라벨 소숫점 자리
            propsForBackgroundLines: {
              strokeWidth: 0,
            },
            propsForBackgroundLines: {
              strokeDasharray: '4', // 점선 스타일
              stroke: '#ddd', // 눈금선 색상
              strokeWidth: 1, // 눈금선 두께
            },
          }}
          withDots={false}
          bezier
          style={styles.chart}
        />
      )}

      {/* 탭 */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.tab, selectedTab === tab.label && styles.activeTab]}
            onPress={() => setSelectedTab(tab.label)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.label && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 하단 버튼 */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>즐겨찾기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  currencyValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 5,
  },
  subtext: {
    fontSize: 14,
    color: '#007BFF',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 20,
    paddingBottom: -30,
    paddingTop: 20,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
