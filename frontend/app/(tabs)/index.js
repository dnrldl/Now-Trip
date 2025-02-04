import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchExchangeRateList } from '../../api/exchangeRateApi';
import currencySymbols from '../../utils/currencySymbols';
import { SvgUri } from 'react-native-svg';
import FlagImage, { clearAllFiles } from '../../components/FlagImage';

export default function HomeScreen() {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const [showUpBtn, setShowUpBtn] = useState(false);
  const flatListRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const initExchangeList = async () => {
    setLoading(true);
    setRefreshing(false);
    try {
      const response = await fetchExchangeRateList(0);
      setIsLast(response.last);
      setExchangeRates(response.content);
    } catch (err) {
      setError('데이터를 불러오는 중 문제가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowUpBtn(offsetY > 200);
  };

  useEffect(() => {
    initExchangeList();
    setShowUpBtn(false);
  }, []);

  const handleLoadMore = async () => {
    if (isLast) return;

    try {
      setPage((prevPage) => prevPage + 1);
      const response = await fetchExchangeRateList(page + 1);
      setIsLast(response.last);
      setExchangeRates((prev) => [...prev, ...response.content]);
    } catch (error) {
      setError('데이터를 불러오는 중 문제가 발생했습니다.');
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await initExchangeList();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#0000ff' />
        <Text>데이터를 로드 중입니다...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>오류가 발생했습니다: {error}</Text>
      </View>
    );
  }

  const getChangeColor = (percentage) => {
    if (percentage > 0) return '#FF4D4D'; // 빨간색 (상승)
    if (percentage < 0) return '#007BFF'; // 파란색 (하락)
    return '#A9A9A9'; // 회색 (변동 없음)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환율 정보</Text>

      <FlatList
        ref={flatListRef}
        data={exchangeRates}
        keyExtractor={(item, index) => `${item.targetCurrency}-${index}`}
        renderItem={({ item, index }) => {
          const currencySymbol =
            currencySymbols[item.targetCurrency] || item.targetCurrency;
          const currencyCode = item.iso2Code.toLowerCase();

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/exchange-details',
                  params: { currency: item.targetCurrency },
                })
              }
            >
              <View style={styles.item}>
                {/* 순위 표시 */}
                <Text style={styles.rank}>{index + 1}</Text>

                {/* 통화 기호 */}
                <View style={styles.symbolContainer}>
                  {item.iso2Code ? (
                    <FlagImage countryCode={currencyCode} />
                  ) : (
                    <Text style={styles.currencySymbol}>🏳️</Text>
                  )}
                </View>

                {/* 통화 정보 */}
                <View style={styles.infoContainer}>
                  <Text style={styles.currencyText}>{item.targetCurrency}</Text>
                  <Text style={styles.rateText}>
                    {currencySymbol} {item.rate.toLocaleString()}
                  </Text>
                </View>

                {/* 변화율 */}
                <Text
                  style={[
                    styles.changeRate,
                    { color: getChangeColor(item.rateChangePercentage) },
                  ]}
                >
                  {item.rateChangePercentage > 0
                    ? `+${item.rateChangePercentage.toFixed(1)}%`
                    : `${item.rateChangePercentage.toFixed(1)}%`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0}
        ListFooterComponent={
          isLast && <Text style={styles.lastText}>마지막 목록입니다.</Text>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {showUpBtn && (
        <TouchableOpacity
          style={styles.upBtn}
          onPress={() =>
            flatListRef.current.scrollToOffset({
              animated: true,
              offset: 0,
            })
          }
        >
          <Text style={styles.upBtnText}>▲ 맨 위로</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
    width: 30,
    textAlign: 'center',
    color: '#007BFF',
  },
  symbolContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    flex: 1,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rateText: {
    fontSize: 14,
    color: '#666',
  },
  changeRate: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  lastText: {
    textAlign: 'center',
    color: '#555',
  },
  upBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  upBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
