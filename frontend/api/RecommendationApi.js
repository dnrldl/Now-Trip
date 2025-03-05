import { publicAxios } from './axiosInstance';
import handleError from './handleApiError';

const PATH = '/recommendation';

export const fetchRecommendations = async (budget) => {
  try {
    const response = await publicAxios.get(PATH, {
      params: { budget },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
