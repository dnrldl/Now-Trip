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
import MyPageTabs from '../../../components/MyPageTabs';
import UserImage from '../../../components/UserImage';

export default function MyPageScreen() {
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 초기값: false
  const [error, setError] = useState(null);
  const { authState, deleteTokens } = useAuth();
  const router = useRouter();

  const initUserInfo = async () => {
    setError(null);
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
    initUserInfo();
  }, []);

  // 비로그인 상태 처리
  if (!authState.isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.authTitle}>로그인이 필요합니다</Text>
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
            await deleteTokens();
            Alert.alert('로그아웃', '로그아웃 되었습니다.');
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
      {/* 상단 프로필 영역 */}
      <View style={styles.profileSection}>
        <UserImage uri={userInfo.profile} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{userInfo?.nickname || '사용자'}</Text>
          <Text style={styles.email}>{userInfo?.email}</Text>
        </View>
      </View>

      {/* 프로필 편집 버튼 */}
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => router.push('/mypage/edit-profile')}
      >
        <Text style={styles.editProfileText}>프로필 편집</Text>
      </TouchableOpacity>

      <MyPageTabs />

      {/* 로그아웃 버튼 */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  editProfileButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B3B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
