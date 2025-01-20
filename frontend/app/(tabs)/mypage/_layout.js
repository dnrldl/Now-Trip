import { Stack } from 'expo-router';

export default function MyPageLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' />
      <Stack.Screen
        name='myPosts'
        options={{
          headerBackButtonDisplayMode: 'minimal',
          headerTitle: '내 게시글',
        }}
      />
    </Stack>
  );
}
