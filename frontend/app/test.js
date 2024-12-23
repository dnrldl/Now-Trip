import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TestScreen = () => {
  const [storedValue, setStoredValue] = useState(null);
  const [storedValue2, setStoredValue2] = useState(null);

  const saveValue = async () => {
    await SecureStore.setItemAsync('testKey', 'testValue');
    alert('값 저장 완료');
  };

  const loadValue = async () => {
    const value = await SecureStore.getItemAsync('accessToken');
    const value2 = await SecureStore.getItemAsync('testKey');
    setStoredValue(value);
    setStoredValue2(value2);
  };

  const deleteValue = async () => {
    await SecureStore.deleteItemAsync('testKey');
    alert('값 삭제 완료');
    setStoredValue2(null);
  };

  useEffect(() => {
    loadValue();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>저장된 값: {storedValue || '없음'}</Text>
      <Text>저장된 값: {storedValue2 || '없음'}</Text>
      <Button title='값 저장' onPress={saveValue} />
      <Button title='값 삭제' onPress={deleteValue} />
      <Button title='값 로드' onPress={loadValue} />
    </View>
  );
};

export default TestScreen;
