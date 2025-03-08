import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { toggleCommentLike } from '../api/postApi';

export default function CommentAction({ comment }) {
  const [likeCount, setLikeCount] = useState(comment.likeCount); // 좋아요 수 상태
  const [isLiked, setIsLiked] = useState(comment.liked); // 좋아요 여부 상태
  const { authState } = useAuth();

  const handleLikePress = async () => {
    if (!authState?.isAuthenticated) {
      Alert.alert('로그인 필요!', '로그인 후 이용해주세요.', [
        {
          text: '확인',
        },
      ]);
      return;
    }
    // 이전 상태를 참조
    const previousLiked = isLiked;
    const previousLikeCount = likeCount;

    // 낙관적 업데이트
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const response = await toggleCommentLike(comment.id);
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(previousLiked);
      setLikeCount(previousLikeCount);
      Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color='red'
        />
        <Text style={styles.actionText}>{likeCount}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
});
