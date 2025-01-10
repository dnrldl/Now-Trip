import React, { createContext, useState, useEffect, useContext } from 'react';

// Context 생성
const ExchangeRateContext = createContext();

// Context Provider 컴포넌트
export const ExchangeRateProvider = ({ children }) => {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/exchange/all');
        const data = await response.json();
        setExchangeRates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  return (
    <ExchangeRateContext.Provider value={{ exchangeRates, loading, error }}>
      {children}
    </ExchangeRateContext.Provider>
  );
};

export const useExchangeRates = () => useContext(ExchangeRateContext);
