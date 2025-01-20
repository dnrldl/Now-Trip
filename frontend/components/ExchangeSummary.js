import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchExchangeHistory } from '../api/exchangeRate';

export default function ExchangeSummary({ currency }) {
  const [currentRate, setCurrentRate] = useState(null);
  const [previousRate, setPreviousRate] = useState(null);
  const [difference, setDifference] = useState(null);

  const fetchRecentRates = async () => {
    try {
      const response = await fetchExchangeHistory(currency, 'weekly'); // 최근 1주 데이터를 가져옴
      if (response.length >= 2) {
        const latest = response[0].exchangeRate;
        const previous = response[1].exchangeRate;

        setCurrentRate(latest);
        setPreviousRate(previous);
        setDifference(latest - previous); // 차이 계산
      }
    } catch (error) {
      console.error('환율 데이터 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchRecentRates();
  }, [currency]);

  return (
    <View style={styles.container}>
      {currentRate !== null && previousRate !== null ? (
        <>
          <Text style={styles.currentRate}>
            현재 환율: {currentRate.toFixed(2)}원
          </Text>
          <Text
            style={[
              styles.difference,
              difference > 0 ? styles.increase : styles.decrease,
            ]}
          >
            {difference > 0
              ? `+${difference.toFixed(2)}원 (+${(
                  (difference / previousRate) *
                  100
                ).toFixed(2)}%)`
              : `${difference.toFixed(2)}원 (${(
                  (difference / previousRate) *
                  100
                ).toFixed(2)}%)`}
          </Text>
        </>
      ) : (
        <Text>환율 데이터를 가져오는 중...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'center',
  },
  currentRate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  difference: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  increase: {
    color: 'green',
  },
  decrease: {
    color: 'red',
  },
});
