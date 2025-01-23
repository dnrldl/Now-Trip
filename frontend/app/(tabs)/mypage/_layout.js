import { Stack } from 'expo-router';

export default function MyPageLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='my-posts'
        options={{
          headerShown: true,
          title: '내 게시글',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
