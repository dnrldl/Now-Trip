import { privateAxios, publicAxios } from './axiosInstance';
import handleError from './handleApiError';
export const register = async (userData) => {
  try {
    const response = await publicAxios.post('/users/register', userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const loginRequest = async (userData) => {
  try {
    const response = await publicAxios.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const logoutRequest = async () => {
  try {
    const response = await privateAxios.post('/auth/logout');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const validateToken = async () => {
  try {
    const response = await privateAxios.get('/auth/validate-token');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
