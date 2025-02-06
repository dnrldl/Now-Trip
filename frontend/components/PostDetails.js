import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { addComment, fetchComments, fetchPost } from '../api/postApi';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import DateInfo from './DateInfo';
import CommentList from './CommentList';
import CommentInput from './CommentInput';

export default function PostDetails() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const postRes = await fetchPost(postId);
      setPost(postRes);

      console.log(postRes);

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
      const newComment = response.content;

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
        <ActivityIndicator size='large' color='#fff' />
        <Text style={styles.loadingText}>데이터를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {post && (
        <View style={styles.postBox}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.meta}>
            {post.createdBy} • <DateInfo createdAt={post.createdAt} />
          </Text>

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
              resizeMode='center'
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            <Text style={styles.content}>{post.content}</Text>
          </View>
        </View>
      )}

      {/* 댓글 리스트 */}
      <CommentList comments={comments} />

      {/* 댓글 입력 부분 */}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  postBox: {},
  meta: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    color: '#000',
    marginBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
  imageContainer: {
    width: '100%',
    height: 250, // 이미지 높이 지정
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#f0f0f0', // 로딩 중일 때 기본 배경색 추가
  },
  imageLoader: {
    position: 'absolute', // 스피너를 이미지 중앙에 배치
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});
