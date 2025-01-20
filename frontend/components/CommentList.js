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
        ListEmptyComponent={
          <Text style={styles.noComment}>
            댓글이 없습니다. 첫 번째로 댓글을 달아보세요!
          </Text>
        }
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
  noComment: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});
