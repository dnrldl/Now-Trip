import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { deletePost, fetchMyPosts } from '../../../../api/postApi';
import DateInfo from '../../../../components/DateInfo';

export default function MyPostsScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0); // 불러올 페이지 번호
  const [refreshing, setRefreshing] = useState(false); // 새로고침
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLast, setIsLast] = useState(false); // 마지막 페이지인지 판별
  const [showUpBtn, setShowUpBtn] = useState(false); // 맨 위로 버튼
  const flatListRef = useRef(null);
  const router = useRouter();

  const initPosts = async () => {
    setLoading(true);
    setRefreshing(false);
    try {
      const data = await fetchMyPosts(0);
      const postData = data.content;

      setPosts(postData);
      setIsLast(data.last);
      console.log('게시글 로드 완료');
    } catch (err) {
      setError('게시글을 불러오는 중 문제가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowUpBtn(false);
    initPosts();
  }, []);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowUpBtn(offsetY > 200);
  };

  const handleLoadMore = async () => {
    if (isLast) return;
    try {
      setPage((prevPage) => prevPage + 1);
      const data = await fetchMyPosts(page + 1);
      const postData = data.content;
      const pageData = data.page;

      if (page == pageData.totalPages - 1) setIsLast(true);

      setPosts([...posts, ...postData]);
    } catch (err) {
      setError('게시글을 불러오는 중 문제가 발생했습니다.');
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await initPosts();
    } catch (err) {
      setError('게시글을 새로고침하는 중 문제가 발생했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  const onDelete = async (postId) => {
    Alert.alert('정말 삭제하시겠습니까?', '', [
      {
        text: '취소',
      },
      {
        text: '확인',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(postId);
            setPosts((prevPosts) =>
              prevPosts.filter((post) => post.id !== postId)
            );
            Alert.alert('삭제 완료', '게시글이 성공적으로 삭제되었습니다.');
          } catch (err) {
            Alert.alert('삭제 실패', '게시글 삭제 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#0000ff' />
        <Text>게시글을 불러오는 중입니다...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (posts.length == 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noContentText}>내 게시글이 없습니다.</Text>
      </View>
    );
  }

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity
        style={styles.postContent}
        onPress={() =>
          router.push({
            pathname: '/mypage/my-posts/details',
            params: { postId: item.id.toString() },
          })
        }
      >
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text>{item.createdBy}</Text>
        <Text style={styles.postInfo}>
          주제:{' '}
          {item.country === 'Unknown Country' ? '자유 게시판' : item.country}
        </Text>
        <Text style={styles.postInfo}>
          <DateInfo createdAt={item.createdAt} />
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>삭제</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0}
        ListFooterComponent={
          isLast && <Text style={styles.lastText}>마지막 게시글입니다.</Text>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* 맨 위로 버튼 */}
      {showUpBtn && (
        <TouchableOpacity
          style={styles.upBtn}
          onPress={() =>
            flatListRef.current.scrollToOffset({
              animated: true,
              offset: 0,
            })
          }
        >
          <Text style={styles.upBtnText}>▲ 맨 위로</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },

  list: {
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  postContainer: {
    flexDirection: 'row', // 가로 정렬
    alignItems: 'center', // 수직 중앙 정렬
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 120,
  },
  postContent: {
    flex: 1, // 남은 공간을 차지하도록 설정
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: '#FF5722', // 버튼 색상
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 50,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastText: {
    textAlign: 'center',
    color: '#555',
  },
  upBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  upBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noContentText: {
    color: '#555',
  },
});
