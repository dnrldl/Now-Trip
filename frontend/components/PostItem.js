import { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateInfo from './DateInfo';
import PostAction from './PostAction';
import PostImage from './PostImage';

const SCREEN_WIDTH = Dimensions.get('window').width;

// 개별 게시글
const PostItem = ({ item, router }) => {
  const [showFullText, setShowFullText] = useState(false);

  // 상세 페이지 이동

  return (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() =>
        router.push({ pathname: '/posts/details', params: { postId: item.id } })
      }
    >
      {/* 작성자 정보 */}
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: item.profile || require('../assets/images/favicon.png'),
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
      {item.imgUrl && <PostImage uri={item.imgUrl} />}

      {/* 좋아요, 댓글 */}
      <PostAction post={item} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default PostItem;
