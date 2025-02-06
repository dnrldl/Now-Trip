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
    setLoading(true);
    setRefreshing(false);
    try {
      const data = await fetchPosts(0);
      setIsLast(data.last);
      setPosts(data.content);
    } catch (err) {
      setError('게시글을 불러오는 중 문제가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    loadTokens();
    if (isLast) return;
    try {
      setPage((prevPage) => prevPage + 1);
      const data = await fetchPosts(page + 1);
      if (page == data.page.totalPages - 1) setIsLast(true);
      setPosts([...posts, ...data.content]);
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
        {
          text: '확인',
        },
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
        renderItem={({ item }) => <PostItem item={item} router={router} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => !isLast && handleLoadMore()}
        onEndReachedThreshold={1}
      />
    </View>
  );
}

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

  return (
    <View
      style={styles.postContainer}
      onPress={() =>
        router.push({
          pathname: '/posts/details',
          params: { postId: item.id.toString() },
        })
      }
    >
      {/* 작성자 정보 */}
      <View style={styles.postHeader}>
        <Text style={styles.username}>{item.createdBy}</Text>
      </View>

      {/* 게시물 이미지 슬라이더 */}
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
                  backgroundColor: index === currentIndex ? '#007BFF' : '#ccc',
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* 좋아요, 댓글 정보 */}
      <View style={styles.postFooter}>
        <PostAction post={item} />
        <Text style={styles.postContent}>{item.content}</Text>
        <Text style={styles.postDate}>
          <DateInfo createdAt={item.createdAt} />
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
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
  postContainer: {
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  imageSliderContainer: {
    position: 'relative',
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: 400,
    backgroundColor: '#f0f0f0',
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
  postFooter: {
    padding: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  postDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 3,
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
});
