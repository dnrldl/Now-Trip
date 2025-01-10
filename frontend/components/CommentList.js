import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import CommentItem from './CommentItem';

export default function CommentList({ comments }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>댓글</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CommentItem comment={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
});
