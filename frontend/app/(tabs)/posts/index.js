import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchPosts } from '../../../api/post';
import { useAuth } from '../../../context/AuthContext';

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0); // 불러올 페이지 번호
  const [refreshing, setRefreshing] = useState(false); // 새로고침
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLast, setIsLast] = useState(false); // 마지막 페이지인지 판별
  const [showUpBtn, setShowUpBtn] = useState(false); // 맨 위로 버튼
  const flatListRef = useRef(null);
  const router = useRouter();
  const { authState } = useAuth();

  const loadPosts = async (page) => {
    try {
      setPosts([]);
      setLoading(true);
      const data = await fetchPosts(page);
      const postData = data.content;

      setIsLast(data.last);
      setPosts(postData);
      console.log('게시글 로드 완료');
    } catch (err) {
      setError('게시글을 불러오는 중 문제가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async () => {
    if (!authState.isAuthenticated) {
      Alert.alert('로그인 필요!', '로그인 후 이용해주세요.');
      router.push('/login');
      return;
    }
    router.push('/posts/addPost');
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowUpBtn(offsetY > 200);
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
  };

  // useEffect(() => {
  //   loadPosts();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      setShowUpBtn(false);
      setPage(0);
      loadPosts(0);
    }, [])
  );

  const handleLoadMore = async () => {
    setPage(page + 1);
    try {
      const data = await fetchPosts(page + 1);
      const postData = data.content;
      setIsLast(data.last);
      setPosts([...posts, ...postData]);
    } catch (err) {
      setError('게시글을 불러오는 중 문제가 발생했습니다.');
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await loadPosts();
    } catch (err) {
      setError('게시글을 새로고침하는 중 문제가 발생했습니다.');
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>게시판</Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAddPost}>
          <Text style={styles.addButtonText}>+ 작성</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postContainer}
            onPress={() =>
              router.push({
                pathname: '/posts/details',
                params: { postId: item.id.toString() },
              })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.createdBy}</Text>
            <Text style={styles.country}>
              주제:{' '}
              {item.country == 'Unknown Country' ? '자유 게시판' : item.country}
            </Text>
            <Text style={styles.country}>
              {new Date(item.createdAt).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0}
        ListFooterComponent={
          isLast && <Text style={styles.lastText}>마지막 페이지 입니다</Text>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {showUpBtn && (
        <TouchableOpacity style={styles.upBtn} onPress={scrollToTop}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  country: {
    fontSize: 14,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
});
