import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useExchangeRates } from '../../contexts/ExchangeRateContext';
import DropDownPicker from 'react-native-dropdown-picker';

const Calculator = () => {
  const { exchangeRates, loading, error } = useExchangeRates();
  const [open, setOpen] = useState(false); // 드롭다운 열기/닫기 상태
  const [selectedRate, setSelectedRate] = useState(null); // 선택한 환율
  const [amount, setAmount] = useState(''); // 입력 금액
  const [convertedAmount, setConvertedAmount] = useState(null); // 변환 결과

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#007BFF' />
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

    const result = parseFloat(amount) * selectedRate;
    setConvertedAmount(result.toFixed(2)); // 소수점 2자리로 표시
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환율 계산기</Text>

      <DropDownPicker
        open={open}
        value={selectedRate}
        items={exchangeRates.map((item) => ({
          label: `${item.targetCurrency} (${item.exchangeRate.toFixed(2)})`,
          value: item.exchangeRate,
        }))}
        setOpen={setOpen}
        setValue={setSelectedRate}
        placeholder='환율 선택'
        dropDownContainerStyle={styles.dropdownContainer}
        style={styles.dropdown}
      />

      <TextInput
        style={styles.input}
        placeholder='금액 입력 (USD)'
        keyboardType='numeric'
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.button} onPress={handleConvert}>
        <Text style={styles.buttonText}>변환하기</Text>
      </TouchableOpacity>

      {convertedAmount && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>변환 결과</Text>
          <Text style={styles.result}>
            {amount} USD → {convertedAmount}{' '}
            {
              exchangeRates.find((rate) => rate.exchangeRate === selectedRate)
                ?.targetCurrency
            }
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    marginBottom: 20,
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
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#E8F0FE',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  result: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
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
