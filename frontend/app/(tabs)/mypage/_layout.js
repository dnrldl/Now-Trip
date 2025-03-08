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
        name='edit-profile'
        options={{
          title: '프로필 편집',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='details'
        options={{
          title: '게시글 상세',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
