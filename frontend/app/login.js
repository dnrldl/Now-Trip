import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const BACKEND_OAUTH_URL = 'http://localhost:8080/oauth2/authorization/';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, setTokens } = useAuth();
  const router = useRouter();

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'nowtrip',
    path: 'callback',
  });

  const handleLogin = async () => {
    setError('');

    try {
      await login({ email, password });
      Alert.alert('로그인 성공', '환영합니다!');
      router.replace('/');
    } catch (error) {
      console.log('로그인 실패: ', error.message);
      setError(error.message);
    }
  };

  const handleSocialLogin = async (platform) => {
    console.log(platform + ' 로그인 실행');
    const authUrl = `${
      BACKEND_OAUTH_URL + platform
    }?redirect_uri=${redirectUri}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const accessToken = queryParams.accessToken;
        const refreshToken = queryParams.refreshToken;

        await setTokens(accessToken, refreshToken);
        console.log(platform + ' 소셜 로그인 성공');

        router.push('/');
      }
    } catch (error) {
      console.error(err);
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
        autoCapitalize='none'
      />

      <TextInput
        style={styles.input}
        placeholder='비밀번호'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize='none'
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button
        title='구글 계정으로 로그인'
        onPress={() => handleSocialLogin('google')}
      />
      <Button
        title='네이버 계정으로 로그인'
        onPress={() => handleSocialLogin('naver')}
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 5,
  },
});
