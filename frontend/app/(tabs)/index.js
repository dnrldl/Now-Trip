import React from 'react';
import {
  ActivityIndicator,
  Text,
  StyleSheet,
  FlatList,
  View,
} from 'react-native';
import { useExchangeRates } from '../../context/ExchangeRateContext';

export default function HomeScreen() {
  const { exchangeRates, loading, error } = useExchangeRates();

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환율 정보</Text>
      <FlatList
        data={exchangeRates}
        keyExtractor={(item, index) => `${item.targetCurrency}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.currencyText}>
              {item.targetCurrency}: {item.exchangeRate.toFixed(2)}
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
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
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
