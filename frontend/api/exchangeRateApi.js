import { publicAxios } from './axiosInstance';
import handleError from './handleApiError';

const PATH = '/exchanges';

export const fetchExchangeRateList = async () => {
  try {
    const response = await publicAxios.get(PATH + '/list');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchExchangeRates = async () => {
  try {
    const response = await publicAxios.get(PATH + '/latest');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchExchangeHistoryWithChange = async (currency, filter) => {
  try {
    const response = await publicAxios.get(PATH + '/history-change', {
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
