import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

export default function MyPostsLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />

      <Stack.Screen
        name='details'
        options={{
          title: '게시글 상세',
          presentation: 'modal',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
