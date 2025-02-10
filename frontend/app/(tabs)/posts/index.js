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

  // 로그인 여부에 따라 공개/비공개글 API를 사용
  let fetchPosts = authState.isAuthenticated
    ? fetchPrivatePosts
    : fetchPublicPosts;

  useEffect(() => {
    loadTokens();
    initPosts();
  }, []);

  const initPosts = async () => {
    setLoading(true);
    setRefreshing(false);
    try {
      const data = await fetchPosts(0);
      setIsLast(data.last);
      setPosts(data.content);
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
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

/** 개별 게시글 컴포넌트 */
const PostItem = ({ item, router }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  // 상세보기로 이동
  const goToDetail = () => {
    router.push({
      pathname: '/posts/details',
      params: { postId: item.id.toString() },
    });
  };

  return (
    <TouchableOpacity style={styles.postContainer} onPress={goToDetail}>
      {/* 상단 작성자 영역 */}
      <View style={styles.postHeader}>
        {/* 프로필 이미지 (없다면 기본 이미지 사용) */}
        <Image
          source={{
            uri: item.authorProfileImageUrl || 'https://placehold.co/36x36',
          }}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          {/* 닉네임 & (예시) 랭크 */}
          <View style={styles.userRow}>
            <Text style={styles.username}>{item.createdBy}</Text>
            <Text style={styles.userBadge}>20대 · 상위1%</Text>
          </View>
          {/* 작성시간 */}
          <Text style={styles.postDate}>
            <DateInfo createdAt={item.createdAt} />
          </Text>
        </View>
      </View>

      {/* 게시글 텍스트 내용 */}
      {item.content ? (
        <Text style={styles.postContent}>{item.content}</Text>
      ) : null}

      {/* 게시물 이미지 슬라이더 */}
      {item.imgUrl && item.imgUrl.length > 0 && (
        <View style={styles.imageSliderContainer}>
          <FlatList
            data={item.imgUrl}
            horizontal
            pagingEnabled
            decelerationRate='fast'
            snapToAlignment='center'
            snapToInterval={SCREEN_WIDTH}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(image, index) => `${item.id}-image-${index}`}
            renderItem={({ item: imageUri }) => (
              <Image
                source={{ uri: imageUri }}
                style={styles.postImage}
                resizeMode='cover'
              />
            )}
            viewabilityConfigCallbackPairs={
              viewabilityConfigCallbackPairs.current
            }
          />

          {/* 슬라이드 인디케이터 */}
          <View style={styles.indicatorContainer}>
            {item.imgUrl.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      index === currentIndex ? '#007BFF' : '#ccc',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* 좋아요, 댓글(예시로 PostAction 사용) */}
      <View style={styles.footerActions}>
        <PostAction post={item} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 전체 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // 로딩/에러 화면 중앙 배치
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },

  // 개별 게시글 컨테이너
  postContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f8f8',
    backgroundColor: '#fff',
  },
  // 상단 헤더(작성자 정보)
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#ccc',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },
  userBadge: {
    fontSize: 13,
    color: '#ff4500',
    backgroundColor: '#ffece6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // 게시글 본문 텍스트
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },

  // 이미지 슬라이더
  imageSliderContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: '#eee',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // 하단 좋아요/댓글 등 액션
  footerActions: {
    marginTop: 4,
  },
});
