import React from 'react';
import { StyleSheet, View } from 'react-native';
import ExchangeRateList from '../../components/ExchangeRateList';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ExchangeRateList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
});
