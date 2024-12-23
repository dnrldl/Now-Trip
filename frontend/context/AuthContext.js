import React, { createContext, useState, useEffect } from 'react';
import { saveToken, getToken, deleteToken } from '../utils/secureStore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });

  // 토큰 저장
  const setTokens = async (accessToken, refreshToken) => {
    await saveToken('accessToken', accessToken);
    await saveToken('refreshToken', refreshToken);
    setAuthState({
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
    });
  };

  // 토큰 삭제
  const clearTokens = async () => {
    await deleteToken('accessToken');
    await deleteToken('refreshToken');
    setAuthState({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  };

  const logout = async () => {
    await deleteToken('accessToken');
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
    });
  };

  const loadTokens = async () => {
    const accessToken = await getToken('accessToken');
    const refreshToken = await getToken('refreshToken');
    if (accessToken) {
      setAuthState({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = await getToken('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh Token이 없습니다.');
    }

    try {
      // 서버에 갱신 요청
      const response = await fetch('http://localhost:8080/api/users/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('토큰 갱신 실패');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await response.json();
      await setTokens(accessToken, newRefreshToken); // 갱신된 토큰 저장
    } catch (error) {
      console.error(error);
      await clearTokens(); // 토큰 삭제 및 로그아웃 처리
    }
  };

  // 앱 로드 시 토큰 가져오기
  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setTokens, clearTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
