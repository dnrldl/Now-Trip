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
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchPosts } from '../../../api/postApi';
import { useAuth } from '../../../contexts/AuthContext';
import DateInfo from '../../../components/DateInfo';

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0); // 불러올 페이지 번호
  const [refreshing, setRefreshing] = useState(false); // 새로고침
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLast, setIsLast] = useState(false); // 마지막 페이지인지 판별
  const [showUpBtn, setShowUpBtn] = useState(false); // 맨 위로 버튼
  const flatListRef = useRef(null);
  const { authState } = useAuth();
  const router = useRouter();

  const initPosts = async () => {
    setLoading(true);
    setRefreshing(false);
    try {
      const data = await fetchPosts(0);
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

  const clickToAddPost = async () => {
    if (!authState.isAuthenticated) {
      Alert.alert('로그인 필요!', '로그인 후 이용해주세요.', [
        {
          text: '확인',
          onPress: () => {
            router.push('/login');
          },
        },
      ]);
      return;
    }

    router.push('/posts/addPost');
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowUpBtn(offsetY > 200);
  };

  useEffect(() => {
    setShowUpBtn(false);
    initPosts();
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     setShowUpBtn(false);
  //     initPosts();
  //   }, [])
  // );

  const handleLoadMore = async () => {
    if (isLast) return;
    try {
      setPage((prevPage) => prevPage + 1);
      const data = await fetchPosts(page + 1);
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
        <TouchableOpacity style={styles.addButton} onPress={clickToAddPost}>
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
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text>{item.createdBy}</Text>
            <Text style={styles.postInfo}>
              주제:{' '}
              {item.country == 'Unknown Country' ? '자유 게시판' : item.country}
            </Text>
            <Text style={styles.postInfo}>
              <DateInfo createdAt={item.createdAt} />
            </Text>
          </TouchableOpacity>
        )}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={1}
        ListFooterComponent={
          isLast && <Text style={styles.lastText}>마지막 게시글입니다.</Text>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  postTitle: {
    fontSize: 24,
    fontWeight: '600',
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
  postInfo: {
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
