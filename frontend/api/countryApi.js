import { publicAxios } from './axiosInstance';
import handleError from './handleApiError';

const PATH = '/country';

export const fetchCountries = async () => {
  try {
    const response = await publicAxios.get(PATH);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
