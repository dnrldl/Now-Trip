import { privateAxios } from './axiosInstance';

export const fetchUserInfo = async () => {
  try {
    const response = await privateAxios.get('/users/myinfo');
    return response.data; // 사용자 정보 반환
  } catch (error) {
    console.error('사용자 정보 요청 실패:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};
