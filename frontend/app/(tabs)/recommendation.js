import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import FlagImage from '../../components/FlagImage';
import { fetchRecommendations } from '../../api/RecommendationApi';

/**
 *
 * {"countryCode": "KR", "countryName": "대한민국", "currencyCode": "KRW", "exchangeRate": 1486.751789, "localBudget": 1000000}
 */

export default function RecommendationList() {
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [budget, setBudget] = useState('100000');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await fetchRecommendations(budget);
      console.log(response);
      setRecommendedPlaces(response);
    } catch (error) {
      console.error('추천 여행지 로딩 실패:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>예산 기반 추천 여행지</Text>
      <View style={styles.budgetInputContainer}>
        <TextInput
          style={styles.budgetInput}
          keyboardType='numeric'
          placeholder='예산 입력 (KRW)'
          value={budget}
          onChangeText={setBudget}
          onSubmitEditing={loadRecommendations}
        />
        <TouchableOpacity
          onPress={loadRecommendations}
          style={styles.budgetButton}
        >
          <Text style={styles.budgetButtonText}>추천</Text>
        </TouchableOpacity>
      </View>

      {recommendedPlaces.length === 0 ? (
        <Text style={styles.noRecommendation}>추천할 여행지가 없습니다.</Text>
      ) : (
        <FlatList
          data={recommendedPlaces}
          keyExtractor={(item, index) => `${item.iso2Code}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.recommendationItem}>
              <FlagImage
                countryCode={item.countryCode}
                style={{ width: 50, height: 50 }}
              />
              <View style={styles.recommendationInfo}>
                <Text style={styles.recommendationText}>
                  {item.countryName}
                </Text>
                <Text style={styles.budgetText}>
                  {item.localBudget.toLocaleString()} {item.currencyCode}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  budgetButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  budgetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recommendationInfo: {
    marginLeft: 15,
  },
  recommendationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  budgetText: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  noRecommendation: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});
