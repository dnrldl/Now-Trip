import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import FlagImage from '../components/FlagImage';
import fetchRecommendations from '../api/RecommendationApi';

export default function RecommendationList() {
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [budget, setBudget] = useState('1000000');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await fetchRecommendations(Number(budget));
      setRecommendedPlaces(response);
    } catch (err) {
      console.error('추천 여행지 로딩 실패:', err);
    }
  };

  return (
    <View style={styles.recommendationContainer}>
      <Text style={styles.sectionTitle}>💰 예산 기반 추천 여행지</Text>
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
              <FlagImage countryCode={item.iso2Code.toLowerCase()} />
              <View style={styles.recommendationInfo}>
                <Text style={styles.recommendationText}>
                  {item.koreanName} ({item.currency})
                </Text>
                <Text style={styles.budgetText}>
                  {item.localBudget.toLocaleString()} {item.currency}
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
  // 스타일 정의 (기존 스타일 유지)
});
