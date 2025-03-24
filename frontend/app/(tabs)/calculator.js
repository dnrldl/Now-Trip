import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchExchangeRates } from '../../api/exchangeRateApi';

const Calculator = () => {
  const [rates, setRates] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState(null);
  const [targetCurrency, setTargetCurrency] = useState(null);
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openBase, setOpenBase] = useState(false);
  const [openTarget, setOpenTarget] = useState(false);

  const loadExchangeRates = async () => {
    try {
      const cached = await AsyncStorage.getItem('exchangeRates');
      const today = new Date().toISOString().slice(0, 10);

      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === today) {
          setRates(parsed.data);
          setLoading(false);
          return;
        }
      }

      const response = await fetchExchangeRates();

      setRates(response);
      await AsyncStorage.setItem(
        'exchangeRates',
        JSON.stringify({ date: today, data })
      );
    } catch (err) {
      Alert.alert('오류 발생', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExchangeRates();
  }, []);

  // 금액, 기준 통화, 타겟 통화가 변경되면 자동 계산
  useEffect(() => {
    if (!amount || !baseCurrency || !targetCurrency) {
      setConvertedAmount(null);
      return;
    }

    const baseRate = rates.find(
      (r) => r.targetCurrency === baseCurrency
    )?.exchangeRate;
    const targetRate = rates.find(
      (r) => r.targetCurrency === targetCurrency
    )?.exchangeRate;

    if (baseRate && targetRate) {
      const usdAmount = parseFloat(amount) / baseRate;
      const result = usdAmount * targetRate;
      setConvertedAmount(result.toFixed(2));
    }
  }, [amount, baseCurrency, targetCurrency]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#007BFF' />
        <Text>환율 정보를 불러오는 중...</Text>
      </View>
    );
  }

  const currencyItems = rates.map((rate) => ({
    label: rate.targetCurrency,
    value: rate.targetCurrency,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환율 계산기</Text>

      {/* 기준 통화 선택 */}
      <DropDownPicker
        open={openBase}
        value={baseCurrency}
        items={currencyItems}
        setOpen={setOpenBase}
        setValue={setBaseCurrency}
        placeholder='기준 통화 선택'
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={3000}
        zIndexInverse={1000}
      />

      {/* 타겟 통화 선택 */}
      <DropDownPicker
        open={openTarget}
        value={targetCurrency}
        items={currencyItems}
        setOpen={setOpenTarget}
        setValue={setTargetCurrency}
        placeholder='변환 통화 선택'
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={2000}
        zIndexInverse={2000}
      />

      <TextInput
        style={styles.input}
        placeholder='금액 입력'
        keyboardType='numeric'
        value={amount}
        onChangeText={setAmount}
      />

      {convertedAmount && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>환율 변환 결과</Text>
          <Text style={styles.result}>
            {amount} {baseCurrency} → {convertedAmount} {targetCurrency}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Calculator;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    marginBottom: 15,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#E8F0FE',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  result: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
