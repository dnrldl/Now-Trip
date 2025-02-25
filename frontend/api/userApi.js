import { privateAxios } from './axiosInstance';
import handleError from './handleApiError';

const PATH = '/users';

export const fetchUserInfo = async () => {
  try {
    const response = await privateAxios.get('/users/myinfo');
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await privateAxios.put(PATH + '/profile', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
