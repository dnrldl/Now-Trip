import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { addComment, fetchComments, fetchPost } from '../api/postApi';
import DateInfo from './DateInfo';
import CommentList from './CommentList';
import CommentInput from './CommentInput';
import PostAction from './PostAction';
import { useAuth } from '../contexts/AuthContext';

export default function PostDetails() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const { authState } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const postRes = await fetchPost(postId);
      setPost(postRes);

      const commentsRes = await fetchComments(postId);
      setComments(commentsRes);
      console.log('게시글 상세, 댓글 로드 완료');
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (comment) => {
    if (comment.trim().length === 0) {
      Alert.alert('알림', '댓글 내용을 입력해주세요');
      return;
    }
    try {
      const response = await addComment(postId, comment);
      const newComment = response;
      setComments((prevComments) => [newComment, ...prevComments]);
    } catch (err) {
      console.error('댓글 추가 중 오류:', err);
      Alert.alert('오류', '댓글을 추가하는 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#666' />
        <Text style={styles.loadingText}>데이터를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {post && (
        <View style={styles.postBox}>
          {/* 상단: 작성자 + 시간 */}
          <View style={styles.header}>
            <Text style={styles.author}>{post.createdBy}</Text>
            <Text style={styles.dot}>·</Text>
            <DateInfo createdAt={post.createdAt} style={styles.dateText} />
          </View>

          {/* 제목 */}
          <Text style={styles.title}>{post.title}</Text>

          {/* 이미지 */}
          {post.imgUrl && (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <ActivityIndicator
                  size='large'
                  color='#000'
                  style={styles.imageLoader}
                />
              )}
              <Image
                source={{ uri: post.imgUrl }}
                style={styles.image}
                resizeMode='cover'
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
            </View>
          )}

          {/* 본문 내용 */}
          <Text style={styles.content}>{post.content}</Text>
        </View>
      )}

      <PostAction post={post} authState={authState} />

      {/* 댓글 리스트 */}
      <CommentList comments={comments} />

      {/* 댓글 입력 영역 */}
      <CommentInput onSubmit={handleAddComment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  postBox: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: '#555',
    fontWeight: 'bold',
  },
  dot: {
    marginHorizontal: 5,
    color: '#999',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageLoader: {
    position: 'absolute',
    zIndex: 1,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});
