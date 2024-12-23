import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { register } from '../services/api';
import { useRouter } from 'expo-router';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateNickname,
  validatePhoneNumber,
} from '../utils/validators'; // 개별 검증 함수 가져오기

export default function RegisterScreen({}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // 오류 메시지 상태 관리
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
    nickname: '',
    phoneNumber: '',
  });

  const router = useRouter();

  // 실시간 입력 검증
  // const handleValidation = (field, value) => {
  //   let error = '';
  //   switch (field) {
  //     case 'email':
  //       if (!validateEmail(value)) error = '유효한 이메일을 입력해주세요.';
  //       break;
  //     case 'password':
  //       if (!validatePassword(value))
  //         error = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.';
  //       break;
  //     case 'name':
  //       if (!validateName(value))
  //         error = '이름은 2~15자 영문, 한글, 공백만 가능합니다.';
  //       break;
  //     case 'nickname':
  //       if (!validateNickname(value))
  //         error = '닉네임은 2~15자 영문, 한글, 공백만 가능합니다.';
  //       break;
  //     case 'phoneNumber':
  //       if (!validatePhoneNumber(value))
  //         error = '올바른 전화번호 형식을 입력해주세요.';
  //       break;
  //     default:
  //       break;
  //   }
  //   setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
  // };

  const handleRegister = async () => {
    // 전체 입력값 검증
    // if (
    //   !validateEmail(email) ||
    //   !validatePassword(password) ||
    //   !validateName(name) ||
    //   !validateNickname(nickname) ||
    //   !validatePhoneNumber(phoneNumber)
    // ) {
    //   Alert.alert('오류', '모든 입력값을 올바르게 입력해주세요.');
    //   return;
    // }

    try {
      const userData = { email, password, name, nickname, phoneNumber };
      const result = await register(userData);
      Alert.alert('회원가입 성공', '로그인 화면으로 이동합니다.');
      router.push('/login'); // 성공 시 로그인 화면으로 이동
    } catch (error) {
      Alert.alert(
        '회원가입 실패',
        error.message || '서버 오류가 발생했습니다.'
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      {/* 이메일 입력 */}
      <View style={styles.inputContainer}>
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder='이메일'
          value={email}
          onChangeText={(value) => {
            setEmail(value);
          }}
          keyboardType='email-address'
          autoCapitalize={'none'}
        />
      </View>

      {/* 비밀번호 입력 */}
      <View style={styles.inputContainer}>
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder='비밀번호'
          value={password}
          onChangeText={(value) => {
            setPassword(value);
          }}
          secureTextEntry
        />
      </View>

      {/* 이름 입력 */}
      <View style={styles.inputContainer}>
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder='이름'
          value={name}
          onChangeText={(value) => {
            setName(value);
          }}
          autoCapitalize={'none'}
        />
      </View>

      {/* 닉네임 입력 */}
      <View style={styles.inputContainer}>
        {errors.nickname ? (
          <Text style={styles.errorText}>{errors.nickname}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder='닉네임'
          value={nickname}
          onChangeText={(value) => {
            setNickname(value);
          }}
          autoCapitalize={'none'}
        />
      </View>

      {/* 전화번호 입력 */}
      <View style={styles.inputContainer}>
        {errors.phoneNumber ? (
          <Text style={styles.errorText}>{errors.phoneNumber}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder='전화번호 (예: 010-1234-5678)'
          value={phoneNumber}
          onChangeText={(value) => {
            setPhoneNumber(value);
          }}
          keyboardType='phone-pad'
        />
      </View>

      <Button title='회원가입' onPress={handleRegister} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 4,
  },
});
