import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveToken, getToken, deleteToken } from '../utils/secureStore';
import { loginRequest, logoutRequest, validateToken } from '../api/auth';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

const AuthContext = createContext();

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
  const router = useRouter();

  const login = async (userData) => {
    try {
      const response = await loginRequest(userData);
      const { accessToken, refreshToken } = response;

      await setTokens(accessToken, refreshToken);
    } catch (error) {
      console.error('로그인 실패:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await logoutRequest();
      await deleteTokens();
      Alert.alert(response.message);
    } catch (err) {
      console.error('로그아웃:', error.response?.data || error.message);
      throw error;
    }
  };

  // 토큰들 SecureStore에 저장
  const setTokens = async (accessToken, refreshToken) => {
    await saveToken(ACCESS, accessToken);
    await saveToken(REFRESH, refreshToken);
    setAuthState({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
    console.log('로그인 성공');
  };

  // 토큰들 삭제
  const deleteTokens = async () => {
    await deleteToken(ACCESS);
    await deleteToken(REFRESH);
    setAuthState({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    console.log('로그아웃 성공');
  };

  const loadTokens = async () => {
    const isValid = await validateToken();
    const accessToken = await getToken(ACCESS);
    const refreshToken = await getToken(REFRESH);

    if (!accessToken || !refreshToken) {
      console.log('비 로그인 상태:앱 실행시 토큰이 없습니다.');
      return;
    }

    // 토큰 유효시
    if (isValid) {
      setAuthState({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });

      console.log('앱 실행시 토큰 로드 완료');
      console.log('accessToken:', accessToken);
      console.log('refreshToken:', refreshToken);
    } else {
      // 토큰 만료시
      console.log('토큰이 유효하지 않습니다.');
      await deleteTokens();
      Alert.alert('세션 만료', '로그인이 필요합니다.', [
        {
          text: '확인',
          onPress: () => {
            router.push('/login');
          },
        },
      ]);
    }
  };

  // 리프레시 토큰으로 엑세스 토큰 갱신
  const refreshAccessToken = async () => {};

  // 앱 로드 시 실행
  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authState, login, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
