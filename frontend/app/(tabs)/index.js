import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import ExchangeRateList from '../../components/ExchangeRateList';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <ExchangeRateList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
});
