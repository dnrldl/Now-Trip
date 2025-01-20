import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function DateInfo({ createdAt }) {
  const time = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ko,
  });
  return <Text style={styles.postInfo}>{time}</Text>;
}

const styles = StyleSheet.create({
  postInfo: {
    color: '#555',
  },
});
