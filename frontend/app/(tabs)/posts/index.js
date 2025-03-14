import React, { useContext, useEffect, useRef, useState } from 'react';
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
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import { fetchPrivatePosts, fetchPublicPosts } from '../../../api/postApi';
import { useAuth } from '../../../contexts/AuthContext';
import PostItem from '../../../components/PostItem';
import { DataContext } from '../../../contexts/DataContext';

const tabs = ['latest', 'likes', 'views', 'comments'];
const periods = [
  { label: '모든 기간', value: 'all' },
  { label: '일간', value: 'daily' },
  { label: '주간', value: 'weekly' },
  { label: '월간', value: 'monthly' },
  { label: '연간', value: 'yearly' },
];

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLast, setIsLast] = useState(false);
  const [activeTab, setActiveTab] = useState('latest'); // 최신순, 인기순, 댓글 많은 순
  const [selectedCountry, setSelectedCountry] = useState(null); // 나라 선택 필터
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 기간 필터
  const [openCountry, setOpenCountry] = useState(false);
  const [openPeriod, setOpenPeriod] = useState(false);
  const flatListRef = useRef(null);
  const { authState } = useAuth();
  const { countries } = useContext(DataContext); // 국가 리스트 가져오기
  const router = useRouter();

  useEffect(() => {
    initPosts();
  }, [activeTab, selectedCountry, selectedPeriod]);

  const initPosts = async () => {
    setError(null);
    setLoading(true);
    setRefreshing(false);
    try {
      let response;
      if (authState.isAuthenticated && authState.accessToken) {
        response = await fetchPrivatePosts(
          0,
          activeTab,
          selectedCountry,
          selectedPeriod
        );
      } else {
        response = await fetchPublicPosts(
          0,
          activeTab,
          selectedCountry,
          selectedPeriod
        );
      }

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

      let response = null;
      if (authState.isAuthenticated && authState.accessToken) {
        response = await fetchPrivatePosts(
          nextPage,
          activeTab,
          selectedCountry,
          selectedPeriod
        );
      } else {
        response = await fetchPublicPosts(
          nextPage,
          activeTab,
          selectedCountry,
          selectedPeriod
        );
      }

      if (!response || !response.content) {
        console.warn('게시글 데이터를 불러오지 못했습니다.');
        return;
      }

      if (nextPage === response?.page?.totalPages - 1) setIsLast(true);

      setPosts((prev) => [...prev, ...response.content]);
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
        <ActivityIndicator size='large' color='#007BFF' />
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
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>게시판</Text>
        <TouchableOpacity style={styles.addButton} onPress={clickToAddPost}>
          <Text style={styles.addButtonText}>+ 작성</Text>
        </TouchableOpacity>
      </View>

      {/* 필터 컨테이너 (탭 + 드롭다운) */}
      <View style={styles.filterContainer}>
        {/* 탭 필터 */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === 'latest'
                  ? '최신'
                  : tab === 'likes'
                  ? '좋아요 수'
                  : tab === 'views'
                  ? '조회 수'
                  : '댓글 수'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownWrapper}>
            {/* 국가 필터 드롭다운 */}
            <DropDownPicker
              open={openCountry}
              value={selectedCountry}
              items={[
                { label: '전체 국가', value: null },
                { label: '자유 게시판', value: 'free' },
                ...countries.map((c) => ({
                  label: c.koreanName,
                  value: c.iso2Code,
                })),
              ]}
              setOpen={setOpenCountry}
              setValue={setSelectedCountry}
              placeholder='전체 국가'
              style={styles.dropdown}
              dropDownContainerStyle={{ borderColor: '#aaa' }}
              textStyle={{ color: '#333' }}
            />
          </View>

          <View style={styles.dropdownWrapper}>
            {/* 기간 필터 */}
            <DropDownPicker
              open={openPeriod}
              value={selectedPeriod}
              items={periods}
              setOpen={setOpenPeriod}
              setValue={setSelectedPeriod}
              style={styles.dropdown}
              dropDownContainerStyle={{ borderColor: '#aaa' }}
              textStyle={{ color: '#333' }}
            />
          </View>
        </View>
      </View>

      {/* 게시글 목록 */}
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostItem item={item} router={router} path={'posts'} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={0.7}
        onEndReached={() => {
          if (!loading && posts?.length > 0) {
            handleLoadMore();
          }
        }}
        ListEmptyComponent={
          <Text style={styles.listFootText}>게시글이 없습니다.</Text>
        }
        ListFooterComponent={
          posts?.length > 0 ? (
            <Text style={styles.listFootText}>마지막 게시글입니다.</Text>
          ) : null
        }
      />
    </View>
  );
}

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

  listFootText: {
    textAlign: 'center',
    paddingVertical: 10,
    color: '#777',
  },

  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  tabText: {
    fontSize: 16,
    color: '#777',
  },
  activeTabText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },

  dropdownContainer: {
    flexDirection: 'row', // 가로 정렬
    justifyContent: 'space-between', // 좌우 정렬
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomColor: '#aaa',
    borderBottomWidth: 0.5,
  },
  dropdownWrapper: {
    flex: 1, // 각 드롭다운이 같은 너비를 차지하도록 설정
    marginHorizontal: 5, // 좌우 간격 조절
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#aaa',
  },
});
