import { publicAxios } from './axiosInstance';
import handleError from './handleApiError';

const PATH = '/exchange';

export const fetchExchangeRates = async () => {
  try {
    const response = await publicAxios.get(PATH);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchExchangeHistory = async (currency, filter) => {
  try {
    const response = await publicAxios.get(PATH + '/history', {
      params: {
        targetCurrency: currency,
        filter,
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// export const fetchExchangeHistory
