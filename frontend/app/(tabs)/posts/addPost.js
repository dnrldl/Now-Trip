import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { addPost } from '../../../api/post';
import { useRouter } from 'expo-router';

export default function AddPostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('제목과 내용을 모두 입력하세요.');
      return;
    }

    try {
      const response = await addPost({ title, content });
      console.log('게시글 작성 결과:', response);
      Alert.alert('게시글 등록', '게시글이 등록되었습니다.');
      router.back(); // 이전 페이지로 돌아가기
    } catch (error) {
      console.error('에러 발생:', error);
      if (error.status === 401) {
        Alert.alert('세션 만료', '로그인이 필요합니다.');
        router.push('/login'); // 로그인 페이지로 이동
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
