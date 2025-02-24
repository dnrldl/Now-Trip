import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchUserInfo } from '../../../api/userApi';
import { useAuth } from '../../../contexts/AuthContext';

export default function MyPageScreen() {
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 초기값: false
  const [error, setError] = useState(null);
  const { authState, deleteTokens } = useAuth();
  const router = useRouter();

  const getUserInfo = async () => {
    try {
      const data = await fetchUserInfo();
      console.log('사용자 정보 로드 완료');
      setUserInfo(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authState.isAuthenticated) {
      Alert.alert('로그인 필요!', '로그인 후 이용해주세요.', [
        {
          text: '확인',
          onPress: () => {
            router.push('/login');
          },
        },
      ]);
      return;
    }
    getUserInfo();
  }, []);

  // 비로그인 상태 처리
  if (!authState.isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>로그인이 필요합니다</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.authButtonText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.authButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 로그인된 상태에서 로딩 중
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#0000ff' />
        <Text>사용자 정보를 불러오는 중입니다...</Text>
      </View>
    );
  }

  // 로그인된 상태에서 에러 발생
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            router.replace('/');
          }}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userInfo && (
        <View>
          <Text style={styles.title}>내 정보</Text>
          <Text style={styles.info}>이름: {userInfo.name}</Text>
          <Text style={styles.info}>닉네임: {userInfo.nickname}</Text>
          <Text style={styles.info}>이메일: {userInfo.email}</Text>
          <Text style={styles.info}>전화번호: {userInfo.phoneNumber}</Text>
          <Text style={styles.info}>
            가입일:{' '}
            {new Date(userInfo.createdAt).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </Text>

          <TouchableOpacity
            style={styles.myPostsButton}
            onPress={() => {
              router.push('/mypage/my-posts');
            }}
          >
            <Text style={styles.myPostsText}>내 게시글</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await deleteTokens();
              Alert.alert('로그아웃', '로그아웃 되었습니다.');
              router.replace('/');
            }}
          >
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  authButton: {
    backgroundColor: '#007BFF',
    width: '50%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B3B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  myPostsButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  myPostsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
