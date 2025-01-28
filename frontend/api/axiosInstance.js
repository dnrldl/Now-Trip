import axios from 'axios';
import { getToken } from '../utils/secureStore';

const API_BASE_URL = 'http://localhost:8080/api';

// 인증이 필요 없는 Axios 인스턴스
export const publicAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증이 필요한 Axios 인스턴스
export const privateAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const initializeAxiosInterceptors = (authContext) => {
  const { authState, refreshAccessToken } = authContext;

  // 요청 인터셉터를 추가하여 토큰을 헤더에 자동으로 포함
  privateAxios.interceptors.request.use(
    async (config) => {
      const token = authState.accessToken;
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
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshToken();

          // 새로운 Access Token으로 원래 요청 재시도
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          console.log('토큰 갱신 성공');
          return privateAxios(originalRequest);
        } catch (error) {
          console.error('토큰 갱신 실패:', error);
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );
};
