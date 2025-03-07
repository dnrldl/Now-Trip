import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchMyPosts } from '../api/postApi';
import PostItem from './PostItem';

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLast, setIsLast] = useState(false);
  const flatListRef = useRef(null);
  const router = useRouter();

  const initPosts = async () => {
    setError(null);
    setLoading(true);
    setRefreshing(false);
    try {
      const data = await fetchMyPosts(0);
      setPosts(data.content);
      setIsLast(false);
      setPage(0);
    } catch (err) {
      console.error('게시글을 불러오는 중 오류 발생:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLast) return;
    try {
      const nextPage = page + 1;
      setPage(nextPage);
      const data = await fetchMyPosts(nextPage);
      if (nextPage === data.page.totalPages - 1) setIsLast(true);
      setPosts((prev) => [...prev, ...data.content]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    initPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await initPosts();
    } finally {
      setRefreshing(false);
    }
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
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostItem item={item} router={router} path={'mypage'} />
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#777',
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
  listFootText: {
    textAlign: 'center',
    paddingVertical: 10,
    color: '#777',
  },
});
