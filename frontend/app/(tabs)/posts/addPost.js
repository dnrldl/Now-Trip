import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { addPost } from '../../../api/postApi';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';

export default function AddPostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [iso3Code, setIso3Code] = useState(null); // 선택한 국가
  const [open, setOpen] = useState(false); // 드롭다운 열기/닫기 상태
  const router = useRouter();

  const countries = [
    {
      countryName: 'Japan',
      iso3Code: 'JPN',
    },
    {
      countryName: 'Korea',
      iso3Code: 'KOR',
    },
  ];

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('게시글 오류', '제목과 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await addPost({ title, content, iso3Code });
      console.log('게시글 작성 결과:', response);
      Alert.alert('게시글 등록', '게시글이 등록되었습니다.');
      router.dismiss();
    } catch (error) {
      console.warn('에러 발생:', error.error);
      if (error.details.title != null) {
        Alert.alert('제목 길이 오류', '제목은 최대 50자까지 입력 가능합니다!');
        return;
      }

      if (error.status === 401 || error.error == 'Unauthorized') {
        Alert.alert('세션 만료', '로그인이 필요합니다.');
        router.back();
      } else {
        Alert.alert('에러 발생', '게시글 작성 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>새로운 게시글</Text>
      <TextInput
        style={styles.input}
        placeholder='제목을 입력하세요'
        value={title}
        onChangeText={(text) => setTitle(text)}
        autoCapitalize='none'
      />
      <DropDownPicker
        open={open}
        value={iso3Code}
        items={countries.map((item) => ({
          label: item.countryName,
          value: item.iso3Code,
        }))}
        setOpen={setOpen}
        setValue={setIso3Code}
        placeholder='국가 선택'
        dropDownContainerStyle={styles.dropdownContainer}
        style={styles.dropdown}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder='내용을 입력하세요'
        value={content}
        onChangeText={(text) => setContent(text)}
        multiline
        autoCapitalize='none'
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>등록</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
