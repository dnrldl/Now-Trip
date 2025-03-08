import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import DateInfo from './DateInfo';
import UserImage from './UserImage';
import CommentAction from './CommentAction';

export default function CommentItem({ comment }) {
  return (
    <View style={styles.commentContainer}>
      <UserImage size={40} uri={comment.authorProfileImage} />
      <View style={styles.commentContent}>
        <Text style={styles.username}>
          {comment.authorNickname + ' '}
          <DateInfo createdAt={comment.createdAt} />
        </Text>
        <Text style={styles.text}>{comment.content}</Text>
      </View>
      <CommentAction comment={comment} />
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingBottom: 15,
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
