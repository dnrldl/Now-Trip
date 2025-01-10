import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useExchangeRates } from '../../context/ExchangeRateContext';

const Calculator = () => {
  const { exchangeRates, loading, error } = useExchangeRates();
  const [selectedRate, setSelectedRate] = useState(null);
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);

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

  // 환율 변환
  const handleConvert = () => {
    if (!selectedRate || !amount) {
      alert('환율을 선택하고 금액을 입력하세요!');
      return;
    }

    const result = parseFloat(amount) * selectedRate.exchangeRate;
    setConvertedAmount(result.toFixed(2)); // 소수점 2자리로 표시
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환율 계산기</Text>
      <FlatList
        data={exchangeRates}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selectedRate?.targetCurrency === item.targetCurrency
                ? styles.selected
                : null,
            ]}
            onPress={() => setSelectedRate(item)}
          >
            <Text style={styles.rateText}>
              {item.targetCurrency}: {item.exchangeRate.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.list}
      />
      <TextInput
        style={styles.input}
        placeholder='금액 입력 (USD)'
        keyboardType='numeric'
        value={amount}
        onChangeText={setAmount}
      />
      <Button title='변환하기' onPress={handleConvert} />
      {convertedAmount && (
        <Text style={styles.result}>
          {amount} USD → {convertedAmount} {selectedRate?.targetCurrency}
        </Text>
      )}
    </View>
  );
};

export default Calculator;

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
  list: {
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  selected: {
    backgroundColor: '#cce5ff',
  },
  rateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  result: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
