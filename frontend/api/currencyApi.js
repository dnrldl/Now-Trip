import { publicAxios } from './axiosInstance';
import handleError from './handleApiError';

const PATH = '/currency';

export const fetchCurrencies = async () => {
  try {
    const response = await publicAxios.get(PATH);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
