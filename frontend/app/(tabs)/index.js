import { router } from 'expo-router';
import React from 'react';
import {
  Animated,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Button,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [60, 0], // 헤더의 높이를 스크롤에 따라 줄임
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Text style={styles.headerText}>헤더</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 60 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <TouchableOpacity onPress={() => router.push('test')}>
          <Text>secure storage 테스트</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('protected')}>
          <Text>보호된 페이지</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.contentText}>스크롤 가능한 컨텐츠</Text>
          <Text style={styles.contentText}>스크롤 가능한 컨텐츠</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    marginVertical: 100,
  },
});
