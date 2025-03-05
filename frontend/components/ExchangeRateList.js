import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchExchangeRateList } from '../api/exchangeRateApi';
import FlagImage from './FlagImage';

export default function ExchangeRateList() {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const flatListRef = useRef(null);

  useEffect(() => {
    initExchangeList();
  }, []);

  const initExchangeList = async () => {
    setError(null);
    setLoading(true);
    setRefreshing(false);
    try {
      const response = await fetchExchangeRateList();
      setExchangeRates(response);
    } catch (err) {
      setError('데이터를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
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

  const getChangeColor = (percentage) => {
    if (percentage > 0) return '#FF4D4D';
    if (percentage < 0) return '#007BFF';
    return '#A9A9A9';
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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={initExchangeList}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>새로 고침</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>환율 정보</Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name='search' size={32} color='#666' />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={exchangeRates}
        keyExtractor={(item, index) => `${item.targetCurrency}-${index}`}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/exchange-details',
                params: { currency: item.targetCurrency },
              })
            }
          >
            <View style={styles.item}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={styles.imageContainer}>
                <FlagImage countryCode={item.flagCode.toLowerCase()} />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.currencyText}>
                  {item.targetCurrency} {item.koreanName}
                </Text>
                <Text style={styles.rateText}>
                  {item.symbol} {item.rate.toLocaleString()}
                </Text>
              </View>
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
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          <Text style={styles.lastText}>마지막 목록입니다.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
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
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  refreshText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
