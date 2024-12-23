import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { fetchExchangeRates } from '../../utils/api';

export default function CalculatorScreen() {
  const [amount, setAmount] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('KRW');
  const [conversionRates, setConversionRates] = useState({});
  const [result, setResult] = useState(null);

  // 환율 데이터를 가져오는 함수
  useEffect(() => {
    const loadRates = async () => {
      try {
        const rates = await fetchExchangeRates(baseCurrency);
        setConversionRates(rates);
      } catch (error) {
        console.error(error);
      }
    };
    loadRates();
  }, [baseCurrency]);

  // 변환 버튼 클릭 시 호출
  const handleConvert = () => {
    if (amount && conversionRates[targetCurrency]) {
      const convertedAmount = (
        parseFloat(amount) * conversionRates[targetCurrency]
      ).toFixed(2);
      setResult(
        `${amount} ${baseCurrency} = ${convertedAmount} ${targetCurrency}`
      );
    } else {
      setResult('입력이 잘못되거나 환율이 유효하지 않습니다');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Converter</Text>
      <TextInput
        style={styles.input}
        placeholder='Enter amount'
        keyboardType='numeric'
        value={amount}
        onChangeText={(text) => {
          const filteredText = text.replace(/[^0-9]/g, '');
          setAmount(filteredText);
        }}
        textAlign='center'
      />
      <Picker
        selectedValue={baseCurrency}
        onValueChange={(itemValue) => setBaseCurrency(itemValue)}
        style={styles.picker}
      >
        {Object.keys(conversionRates).map((currency) => (
          <Picker.Item key={currency} label={currency} value={currency} />
        ))}
      </Picker>
      <Picker
        selectedValue={targetCurrency}
        onValueChange={(itemValue) => setTargetCurrency(itemValue)}
        style={styles.picker}
      >
        {Object.keys(conversionRates).map((currency) => (
          <Picker.Item key={currency} label={currency} value={currency} />
        ))}
      </Picker>
      <Button title='Convert' onPress={handleConvert} />
      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 1,
    borderRadius: 10,
    fontSize: 5,
  },
  picker: {
    marginVertical: 1,
    padding: 0,
  },
  result: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
});
