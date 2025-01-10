import { privateAxios, publicAxios } from './axiosInstance';

export const register = async (userData) => {
  try {
    const response = await publicAxios.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const login = async (userData) => {
  try {
    const response = await publicAxios.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const validateToken = async () => {
  try {
    const response = await privateAxios.post('/auth/validate');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
