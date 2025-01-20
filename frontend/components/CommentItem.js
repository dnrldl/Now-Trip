import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import DateInfo from './DateInfo';

export default function CommentItem({ comment }) {
  return (
    <View style={styles.commentContainer}>
      {/* <Image
        source={{
          uri: comment.profileImage || 'https://via.placeholder.com/40',
        }}
        style={styles.profileImage}
      /> */}
      <View style={styles.commentContent}>
        <Text style={styles.username}>
          {comment.createdBy + ' '}
          <DateInfo createdAt={comment.createdAt} />
        </Text>
        <Text style={styles.text}>{comment.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
  },
  text: {
    fontSize: 14,
    color: '#000',
    marginVertical: 5,
  },
});
