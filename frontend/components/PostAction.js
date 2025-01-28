import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { toggleLike } from '../api/postApi';

export default function PostAction({ post, authState }) {
  // console.log(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount); // 좋아요 수 상태
  const [isLiked, setIsLiked] = useState(post.liked); // 좋아요 여부 상태

  const handleLikePress = async () => {
    if (!authState.isAuthenticated) {
      Alert.alert('로그인 필요!', '로그인 후 이용해주세요.', [
        {
          text: '확인',
        },
      ]);
      return;
    }

    // 1. 낙관적 업데이트 - UI 먼저 변경
    // 이전 상태를 참조
    const previousLiked = isLiked;
    const previousLikeCount = likeCount;

    // 다음 상태를 변수에 저장

    // 낙관적 업데이트
    setIsLiked(!isLiked);
    if (!isLiked) setLikeCount(likeCount + 1);
    else setLikeCount(likeCount - 1);

    try {
      // 2. 서버에 좋아요 요청
      const response = await toggleLike(post.id); // 서버 요청 (post.id를 전달)
      console.log(response);
      if (response) {
        // 서버 응답 값으로 상태 동기화
        // setIsLiked(response.liked); // 서버가 반환한 isLiked 값
        // setLikeCount(response.likeCount); // 서버가 반환한 likeCount 값
      }
    } catch (error) {
      // 3. 실패 시 롤백
      setIsLiked(previousLiked);
      setLikeCount(previousLikeCount);
      Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.actionRow}>
      {/* 좋아요 버튼 */}
      <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color='red'
        />
        <Text style={styles.actionText}>{likeCount}</Text>
      </TouchableOpacity>

      <View style={styles.actionButton}>
        <Ionicons name='chatbubble-outline' size={24} color='black' />
        <Text style={styles.actionText}>{post.commentCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
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
