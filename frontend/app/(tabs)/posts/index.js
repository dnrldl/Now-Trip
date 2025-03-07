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
import { fetchPrivatePosts, fetchPublicPosts } from '../../../api/postApi';
import { useAuth } from '../../../contexts/AuthContext';
import PostItem from '../../../components/PostItem';

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLast, setIsLast] = useState(false);
  const flatListRef = useRef(null);
  const { authState, loadTokens } = useAuth();
  const router = useRouter();

  let fetchPosts = authState.isAuthenticated
    ? fetchPrivatePosts
    : fetchPublicPosts;

  useEffect(() => {
    loadTokens();
    initPosts();
  }, []);

  const initPosts = async () => {
    setError(null);
    setLoading(true);
    setRefreshing(false);
    try {
      const response = await fetchPosts(0);
      setPosts(response.content);
      setIsLast(false);
      setPage(0);
    } catch (err) {
      setError('게시글을 불러오는 중 문제가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLast) return;
    try {
      const nextPage = page + 1;
      setPage(nextPage);
      const data = await fetchPosts(nextPage);
      if (nextPage === data.page.totalPages - 1) setIsLast(true);
      setPosts((prev) => [...prev, ...data.content]);
    } catch (err) {
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await initPosts();
    } finally {
      setRefreshing(false);
    }
  };

  const clickToAddPost = async () => {
    loadTokens();
    if (!authState.isAuthenticated) {
      Alert.alert('로그인 필요!', '로그인 후 이용해주세요.', [
        { text: '확인' },
      ]);
      return;
    }
    router.push('/posts/addPost');
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
        <TouchableOpacity onPress={initPosts} style={styles.refreshButton}>
          <Text style={styles.refreshText}>새로 고침</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>게시판</Text>
        <TouchableOpacity style={styles.addButton} onPress={clickToAddPost}>
          <Text style={styles.addButtonText}>+ 작성</Text>
        </TouchableOpacity>
      </View>

      {/* 게시글 목록 */}
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostItem item={item} router={router} path={'posts'} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={0.7}
        onEndReached={handleLoadMore}
        ListFooterComponent={
          posts.length == 0 ? (
            <Text style={styles.listFootText}>게시글이 없습니다.</Text>
          ) : (
            <Text style={styles.listFootText}>마지막 게시글입니다.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  refreshText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  listFootText: {
    textAlign: 'center',
    paddingVertical: 10,
    color: '#777',
  },
});
