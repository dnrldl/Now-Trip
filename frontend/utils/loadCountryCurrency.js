import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCurrencies } from '../api/currencyApi';
import { fetchCountries } from '../api/countryApi';

const COUNTRIES_KEY = 'cached_countries';
const CURRENCIES_KEY = 'cached_currencies';

// 국가 데이터 가져오기
export const getCountries = async () => {
  try {
    // 캐시된 데이터 가져오기
    const cachedData = await AsyncStorage.getItem(COUNTRIES_KEY);
    if (cachedData) {
      console.log('캐시된 국가 데이터 사용');
      return JSON.parse(cachedData);
    }

    // API 요청
    console.log('국가 데이터 API 요청');
    const response = await fetchCountries();

    // 응답 데이터를 AsyncStorage에 저장
    await AsyncStorage.setItem(COUNTRIES_KEY, JSON.stringify(response));

    return response;
  } catch (error) {
    console.error('국가 데이터 로드 실패:', error);
    return null;
  }
};

// 통화 데이터 가져오기
export const getCurrencies = async () => {
  try {
    // 캐시된 데이터 확인
    const cachedData = await AsyncStorage.getItem(CURRENCIES_KEY);
    if (cachedData) {
      console.log('캐시된 통화 데이터 사용');
      return JSON.parse(cachedData);
    }

    console.log('통화 데이터 API 요청');
    const response = await fetchCurrencies();

    // 응답 데이터를 AsyncStorage에 저장
    await AsyncStorage.setItem(CURRENCIES_KEY, JSON.stringify(response));

    return response;
  } catch (error) {
    console.error('통화 데이터 로드 실패:', error);
    return null;
  }
};

export const deleteDatas = async () => {
  try {
    await AsyncStorage.removeItem(COUNTRIES_KEY);
    await AsyncStorage.removeItem(CURRENCIES_KEY);
    console.log('캐시된 국가 및 통화 데이터 삭제 완료');
  } catch (error) {
    console.error('데이터 삭제 실패:', error);
  }
};
