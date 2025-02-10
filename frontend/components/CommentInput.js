import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Keyboard,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function CommentInput({ onSubmit }) {
  const [comment, setComment] = useState('');
  const [keyboardHeight] = useState(new Animated.Value(0));
  const { authState } = useAuth();
  const router = useRouter();

  const handleSend = () => {
    if (comment.trim().length === 0) return;
    onSubmit(comment);
    setComment('');
    Keyboard.dismiss();
  };

  const handleInputClick = () => {
    if (!authState.isAuthenticated) {
      Alert.alert('로그인 필요!', '로그인 후 이용해주세요.', [
        {
          text: '확인',
          onPress: () => {
            router.push('/login');
          },
        },
      ]);

      return false;
    }
    return true;
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      'keyboardWillShow',
      (event) => {
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height, // 키보드 높이
          duration: event.duration || 300,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      Animated.timing(keyboardHeight, {
        toValue: 20, // 키보드 내려가면 원래 위치로
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [keyboardHeight]);

  return (
    <Animated.View
      style={[
        styles.container,
        { marginBottom: Platform.OS === 'ios' ? keyboardHeight : 0 },
      ]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='댓글을 입력하세요...'
          placeholderTextColor='#aaa'
          value={comment}
          onChangeText={setComment}
          onFocus={handleInputClick}
          autoCapitalize='none'
        />
        {comment.trim().length > 0 && (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>전송</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
