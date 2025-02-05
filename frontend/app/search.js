import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import { fetchExchangeRateList } from '../api/exchangeRateApi';
import FlagImage from '../components/FlagImage';

export default function SearchScreen() {
  const [exchangeRates, setExchangeRates] = useState([]); // 전체 데이터
  const [filteredRates, setFilteredRates] = useState([]); // 필터링된 데이터
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetchExchangeRateList(0);
        setExchangeRates(response.content);
        setFilteredRates(response.content); // 초기값 설정
      } catch (error) {
        console.error('환율 데이터 로딩 실패:', error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredRates(exchangeRates); // 검색어가 없으면 전체 리스트 표시
      return;
    }

    const filtered = exchangeRates.filter(
      (item) =>
        item.targetCurrency.toLowerCase().includes(query.toLowerCase()) ||
        item.countryName.toLowerCase().includes(query.toLowerCase()) // 국가명 검색 가능
    );

    setFilteredRates(filtered);
  };

  return (
    <View style={styles.container}>
      {/* 검색 입력 필드 */}
      <TextInput
        style={styles.searchInput}
        placeholder='통화 코드 또는 국가명 검색...'
        value={searchQuery}
        onChangeText={handleSearch}
        clearButtonMode='always'
        autoCapitalize='none'
      />

      {/* 검색 결과 리스트 */}
      {filteredRates.length > 0 ? (
        <FlatList
          data={filteredRates}
          keyExtractor={(item) => item.targetCurrency}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                router.push({
                  pathname: '/exchange-details',
                  params: { currency: item.targetCurrency },
                })
              }
            >
              <FlagImage countryCode={item.iso2Code} />
              <View style={styles.infoContainer}>
                <Text style={styles.currencyText}>
                  {item.targetCurrency} - {item.countryName}
                </Text>
                <Text style={styles.rateText}>
                  1 USD = {item.rate.toLocaleString()} {item.targetCurrency}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noResult}>검색 결과가 없습니다.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginBottom: 8,
  },
  infoContainer: { marginLeft: 10 },
  currencyText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  rateText: { fontSize: 14, color: '#666' },
  noResult: { textAlign: 'center', fontSize: 16, color: '#999', marginTop: 20 },
});
