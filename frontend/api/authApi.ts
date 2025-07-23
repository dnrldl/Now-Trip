import { privateAxios, publicAxios } from './axiosInstance';
import handleError from './handleApiError';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phoneNumber: string;
}

export const register = async (userData: RegisterData): Promise<any> => {
  try {
    const response = await publicAxios.post('/users/register', userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const loginRequest = async (userData: {
  email: string;
  password: string;
}): Promise<any> => {
  try {
    const response = await publicAxios.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const logoutRequest = async (): Promise<any> => {
  try {
    const response = await privateAxios.post('/auth/logout');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
