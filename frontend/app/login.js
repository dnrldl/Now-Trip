import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../api/auth';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setTokens } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await login({ email, password });
      const { accessToken, refreshToken } = result;
      await setTokens(accessToken, refreshToken); // 토큰 저장
      Alert.alert('로그인 성공', '환영합니다!');
      router.push('/'); // 메인 화면으로 이동
    } catch (error) {
      console.log(error);
      Alert.alert('로그인 실패', error.message || '오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        style={styles.input}
        placeholder='아이디'
        value={email}
        onChangeText={setEmail}
        autoCapitalize={'none'}
      />
      <TextInput
        style={styles.input}
        placeholder='비밀번호'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize='none'
      />
      <Button title='로그인' onPress={handleLogin} />
      <Button title='회원가입' onPress={() => router.replace('/register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
});
