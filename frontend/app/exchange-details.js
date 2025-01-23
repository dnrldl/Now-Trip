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
import { fetchExchangeHistoryWithChange } from '../api/exchangeRateApi';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
  const [change, setChange] = useState({});
  const [latestData, setLatestData] = useState(0);
  const [labels, setLabels] = useState([]);
  const { currency } = useLocalSearchParams();
  const router = useRouter();

  const fetchData = async (currency, filter) => {
    try {
      setIsLoading(true);
      const response = await fetchExchangeHistoryWithChange(currency, filter);
      const rateList = response.rateList;
      setChange({
        rateChange: response.rateChange,
        rateChangePercentage: response.rateChangePercentage,
      });

      const rates = rateList.map((item) => item.exchangeRate);
      const dates = rateList.map((item) => item.lastUpdated);
      const labelCount = dates.length;

      setLatestData(rates.at(-1));
      setData(processDataForFilter(rates, filter));

      if (labelCount > 3) {
        const mid1 = dates[Math.floor(labelCount / 4)];
        const mid2 = dates[Math.floor((labelCount / 4) * 3)];
        const newLabels = ['', mid1, mid2, ''];
        setLabels(newLabels);
      } else {
        setLabels(dates); // 데이터가 너무 적으면 모든 라벨 표시
      }
      console.log('환율 상세 데이터 로드 완료');
    } catch (error) {
      console.log('데이터 가져오기 실패: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 요청하는 기간에 따라 데이터 처리
  const processDataForFilter = (rates, filter) => {
    if (filter === 'weekly') return rates;
    const smoothedData = smoothData(rates);
    const interval = filter === 'monthly' ? 10 : 30;
    return groupDataByInterval(smoothedData, interval);
  };

  const smoothData = useCallback((data, smoothingFactor = 3) => {
    if (data.length <= smoothingFactor) return data;

    const smoothedData = [...data];
    for (let i = 1; i < data.length - 1; i++) {
      const start = Math.max(0, i - Math.floor(smoothingFactor / 2));
      const end = Math.min(data.length, i + Math.ceil(smoothingFactor / 2));
      const subset = data.slice(start, end);
      smoothedData[i] =
        subset.reduce((sum, value) => sum + value, 0) / subset.length;
    }
    return smoothedData;
  }, []);

  const groupDataByInterval = useCallback((data, interval) => {
    if (data.length <= interval) return data;

    const groupedData = [];
    groupedData.push(data[0]); // 첫 번째 값은 그대로 유지
    for (let i = interval; i < data.length; i += interval) {
      const subset = data.slice(i - interval, i);
      const average =
        subset.reduce((sum, value) => sum + value, 0) / subset.length;
      groupedData.push(average);
    }
    groupedData.push(data[data.length - 1]); // 마지막 값은 그대로 유지
    return groupedData;
  }, []);

  useEffect(() => {
    const initialFilter = tabs.find((tab) => tab.label === selectedTab).filter;
    fetchData(currency, initialFilter);
  }, [selectedTab]);

  const getGraphColor = () => {
    if (change.rateChange > 0) return '#FF4D4D'; // 빨간색
    if (change.rateChange < 0) return '#007BFF'; // 파란색
    return '#A9A9A9'; // 회색
  };

  const renderGraph = () => {
    return (
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data,
              color: () => getGraphColor(), // 그래프 색상
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
          color: () => getGraphColor(),
          labelColor: () => '#555555',
          decimalPlaces: 1, // 라벨 소숫점 자리
          propsForBackgroundLines: {
            strokeWidth: 0,
          },

          propsForBackgroundLines: {
            strokeDasharray: '4',
            stroke: '#ddd',
            strokeWidth: 1,
          },
        }}
        withDots={false}
        bezier
        style={styles.chart}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 정보 */}
      <View style={styles.header}>
        <Text style={styles.title}>{currency}</Text>
        <Text style={styles.curInfo}>1USD 기준</Text>
        <Text style={styles.currencyValue}>{latestData.toFixed(2)}</Text>
        <Text style={[styles.subtext, { color: getGraphColor() }]}>
          {selectedTab === '1주'
            ? '지난주보다'
            : selectedTab === '3달'
            ? '3달 전보다'
            : selectedTab === '1년'
            ? '1년 전보다'
            : selectedTab === '전체'
            ? ''
            : ''}{' '}
          {change.rateChange > 0
            ? '+' +
              change.rateChange +
              ' (+' +
              change.rateChangePercentage +
              '%)'
            : change.rateChange + ' (' + change.rateChangePercentage + '%)'}
        </Text>
      </View>

      {/* 그래프 */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color='#0000ff' />
          <Text>게시글을 불러오는 중입니다...</Text>
        </View> // <Text>Loading</Text>
      ) : (
        renderGraph()
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
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/posts')}
      >
        <Text style={styles.buttonText}>관련 게시글 보러 가기</Text>
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
    alignItems: 'flex-start',
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
  curInfo: {
    fontSize: 12,
    color: '#555',
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
    backgroundColor: '#007BFF',
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
