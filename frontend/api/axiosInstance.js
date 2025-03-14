import axios from 'axios';
import { deleteToken, getToken, saveToken } from '../utils/secureStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// 인증(로그인)이 필요 없는 Axios 인스턴스
export const publicAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증(로그인)이 필요한 Axios 인스턴스
export const privateAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await publicAxios.post(
      API_BASE_URL + '/auth/refresh-token',
      { refreshToken: refreshToken }
    );
    const newAccessToken = response.data.accessToken;

    await saveToken('accessToken', newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    await deleteToken('accessToken');
    throw error;
  }
};

// 요청 인터셉터를 추가하여 토큰을 헤더에 자동으로 포함
privateAxios.interceptors.request.use(
  async (config) => {
    const token = await getToken('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('인터셉터 요청: 토큰이 없습니다');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터를 추가하여 토큰 만료 시 처리
privateAxios.interceptors.response.use(
  (response) => response, // 정상 응답 반환
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log('인터셉터 응답: 토큰 만료, Refresh Token으로 재발급 시도');

      try {
        const refreshToken = await getToken('refreshToken');
        const newAccessToken = await refreshAccessToken(refreshToken);

        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return privateAxios.request(error.config);
      } catch (refreshError) {
        console.warn('인터셉터 응답: Refresh 만료됨 -> 강제 로그아웃');
        await deleteToken('accessToken');
        await deleteToken('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
