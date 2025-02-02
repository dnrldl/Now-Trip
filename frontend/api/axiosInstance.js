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
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log('인터셉터 응답: 토큰 만료');
    }
    return Promise.reject(error);
  }
);
