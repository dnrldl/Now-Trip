import { Button, Text, View } from 'react-native';
import React, { Component } from 'react';
import { router, Stack } from 'expo-router';

export default function PostsLayout() {
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
      <Stack.Screen
        name='addPost'
        options={{
          title: '게시글 작성',
          presentation: 'modal',
          headerShown: true,
          headerRight: () => (
            <Button title='닫기' onPress={() => router.back()} />
          ),
        }}
      />
    </Stack>
  );
}
