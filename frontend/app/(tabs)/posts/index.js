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
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchPrivatePosts, fetchPublicPosts } from '../../../api/postApi';
import { useAuth } from '../../../contexts/AuthContext';
import DateInfo from '../../../components/DateInfo';
import PostAction from '../../../components/PostAction';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
          <Text>새로 고침</Text>
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
        renderItem={({ item }) => <PostItem item={item} router={router} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={0.7}
        onEndReached={handleLoadMore}
      />
    </View>
  );
}

// 개별 게시글
const PostItem = ({ item, router }) => {
  const [showFullText, setShowFullText] = useState(false);

  // 상세 페이지 이동
  const goToDetail = () => {
    router.push({
      pathname: '/posts/details',
      params: { postId: item.id.toString() },
    });
  };

  return (
    <TouchableOpacity style={styles.postContainer} onPress={goToDetail}>
      {/* 작성자 정보 */}
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: item.authorProfileImageUrl || 'https://placehold.co/36x36',
          }}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.createdBy}</Text>
          <Text style={styles.postDate}>
            <DateInfo createdAt={item.createdAt} />
          </Text>
        </View>
      </View>

      {/* 제목 */}
      <Text style={styles.postTitle}>{item.title}</Text>

      {/* 내용 (더보기 기능 포함) */}
      {item.content.length > 100 ? (
        <>
          <Text style={styles.postContent}>
            {showFullText ? item.content : `${item.content.slice(0, 100)}...`}
          </Text>
          <TouchableOpacity onPress={() => setShowFullText(!showFullText)}>
            <Text style={styles.moreText}>
              {showFullText ? '접기' : '더보기'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.postContent}>{item.content}</Text>
      )}

      {/* 이미지 */}
      {item.imgUrl && (
        <Image source={{ uri: item.imgUrl }} style={styles.image} />
      )}

      {/* 좋아요, 댓글 */}
      <PostAction post={item} />
    </TouchableOpacity>
  );
};

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

  postContainer: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userInfo: {
    justifyContent: 'center',
  },
  username: { fontSize: 15, fontWeight: '600' },
  postDate: { fontSize: 12, color: '#999' },

  postTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 5 },
  postContent: { fontSize: 14, color: '#333', marginBottom: 5 },
  moreText: { fontSize: 14, color: '#666', marginTop: 3 },

  image: {
    width: SCREEN_WIDTH - 30,
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
