import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 0, // 하단 여백 제거
          height: 55, // 탭바 높이 조정
        },
      }}
    >
      <Tabs.Screen
        name='recommendation'
        options={{
          tabBarLabel: '추천 여행지',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='airplane-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='calculator'
        options={{
          tabBarLabel: '환율 계산기',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='calculator' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='index'
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
          unmountOnBlur: false,
        }}
      />
      <Tabs.Screen
        name='posts'
        options={{
          tabBarLabel: '게시글',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='clipboard' size={size} color={color} />
          ),
          unmountOnBlur: false,
        }}
      />
      <Tabs.Screen
        name='mypage'
        options={{
          tabBarLabel: '마이페이지',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
