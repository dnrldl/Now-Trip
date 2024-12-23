import axios from 'axios';

const API_KEY = '7fca632516fd3a547a62e6de'; // 발급받은 API 키
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

export const fetchExchangeRates = async (baseCurrency) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`
    );
    return response.data.conversion_rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};
