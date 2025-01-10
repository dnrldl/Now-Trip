import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import CommentList from '../../../components/CommentList';

export default function PostDetailsScreen() {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const postResponse = await axios.get(
        `http://localhost:8080/api/posts/${postId}`
      );
      setPost(postResponse.data);

      const commentsResponse = await axios.get(
        `http://localhost:8080/api/posts/${postId}/comments`
      );
      setComments(commentsResponse.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        <>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.meta}>
            {post.createdBy} • {new Date(post.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.content}>{post.content}</Text>
        </>
      )}

      <CommentList comments={comments} />
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
});
