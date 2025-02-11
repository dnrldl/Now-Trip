import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import FlagImage from '../components/FlagImage';
import { DataContext } from '../contexts/DataContext';

export default function SearchScreen() {
  const [exchangeRates, setExchangeRates] = useState([]);
  const { currencies } = useContext(DataContext);
  const [filteredRates, setFilteredRates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    setExchangeRates(currencies);
    setFilteredRates(currencies);
    console.log(filteredRates);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredRates(exchangeRates);
      return;
    }

    const filtered = exchangeRates.filter(
      (item) =>
        item.code?.toLowerCase().includes(query.toLowerCase()) ||
        item.koreanName?.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredRates(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder='통화 코드 또는 국가명 검색...'
        value={searchQuery}
        onChangeText={handleSearch}
        clearButtonMode='always'
        autoCapitalize='none'
      />

      {filteredRates.length > 0 ? (
        <FlatList
          data={filteredRates}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/exchange-details',
                    params: { currency: item.code },
                  })
                }
              >
                <View style={styles.item}>
                  <View style={styles.imageContainer}>
                    <FlagImage countryCode={item.flagCode} />
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.currencyText}>
                      {item.code} {item.koreanName || '국가명 없음'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <Text style={styles.noResult}>검색 결과가 없습니다.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 8,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  noResult: { textAlign: 'center', fontSize: 16, color: '#999', marginTop: 20 },
});
