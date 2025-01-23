import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchExchangeRates } from '../api/exchangeRateApi';

// Context 생성
const ExchangeRateContext = createContext();

// Context Provider 컴포넌트
export const ExchangeRateProvider = ({ children }) => {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExchangeRates = async () => {
    try {
      setLoading(true);
      const response = await fetchExchangeRates();
      setExchangeRates(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExchangeRates();
  }, []);

  return (
    <ExchangeRateContext.Provider value={{ exchangeRates, loading, error }}>
      {children}
    </ExchangeRateContext.Provider>
  );
};

export const useExchangeRates = () => useContext(ExchangeRateContext);
