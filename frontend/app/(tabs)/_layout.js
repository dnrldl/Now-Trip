import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
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
