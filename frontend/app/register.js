import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../api/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('회원가입 요청:', {
      email,
      password,
      name,
      nickname,
      phoneNumber,
    });
    try {
      await register({ email, password, name, nickname, phoneNumber });
      alert('회원가입이 완료되었습니다.');
      router.push('/login');
    } catch (error) {
      alert('회원가입에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        placeholder='이메일'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
      />

      <TextInput
        style={styles.input}
        placeholder='비밀번호'
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        autoCapitalize='none'
      />

      <TextInput
        style={styles.input}
        placeholder='비밀번호 확인'
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        autoCapitalize='none'
      />

      <TextInput
        style={styles.input}
        placeholder='이름'
        value={name}
        onChangeText={setName}
        autoCapitalize='none'
      />

      <TextInput
        style={styles.input}
        placeholder='닉네임'
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize='none'
      />

      <TextInput
        style={styles.input}
        placeholder='전화번호'
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType='phone-pad'
      />

      <Button title='회원가입' onPress={handleRegister} />

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.link}>로그인 하러가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  link: {
    color: '#007BFF',
    textAlign: 'center',
    marginTop: 10,
  },
});
