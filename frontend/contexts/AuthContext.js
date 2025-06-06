import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveToken, getToken, deleteToken } from '../utils/secureStore';
import { loginRequest, logoutRequest } from '../api/authApi';
import { Alert } from 'react-native';
import { publicAxios } from '../api/axiosInstance';

const AuthContext = createContext();

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });

  const login = async (userData) => {
    try {
      const response = await loginRequest(userData);
      const { accessToken, refreshToken } = response;

      await setTokens(accessToken, refreshToken);
      console.log('로그인 성공');
    } catch (error) {
      console.error('로그인 실패:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = logoutRequest();
      await deleteTokens();
      Alert.alert(response.message);
    } catch (error) {
      console.error('로그아웃:', error.response?.data || error.message);
      throw error;
    }
  };

  const setToken = async (key, value) => {
    await saveToken(key, value);
    setAuthState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
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
    console.log('토큰 삭제');
  };

  const updateAuthState = (newState) => {
    setAuthState(newState);
  };

  const loadTokens = async () => {
    const accessToken = await getToken(ACCESS);
    const refreshToken = await getToken(REFRESH);

    if (!accessToken || !refreshToken) {
      console.log('비 로그인 상태:토큰이 없습니다.');
      return;
    }

    if (accessToken && refreshToken) {
      setAuthState({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    } else {
      setAuthState({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  };

  // 리프레시 토큰으로 엑세스 토큰 갱신
  const refreshAccessToken = async () => {
    try {
      const refreshToken = await getToken(REFRESH);
      if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');

      const response = await publicAxios.post(
        '/auth/refresh-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const newAccessToken = response.data.accessToken;

      setAuthState((prevState) => ({
        ...prevState,
        accessToken: newAccessToken,
        isAuthenticated: true,
      }));

      return newAccessToken;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
      });

      throw error;
    }
  };

  // 앱 로드 시 실행
  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        setTokens,
        refreshAccessToken,
        updateAuthState,
        deleteTokens,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
