import React, { createContext, useEffect, useState } from 'react';
import {
  getCountries,
  getCurrencies,
  deleteDatas,
} from '../utils/loadCountryCurrency';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const countryData = await getCountries();
      const currencyData = await getCurrencies();

      if (countryData) setCountries(countryData);
      if (currencyData) setCurrencies(currencyData);
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ countries, currencies }}>
      {children}
    </DataContext.Provider>
  );
};
