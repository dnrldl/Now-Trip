import * as SecureStore from 'expo-secure-store';

// 저장 함수
export async function saveToken(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

// 가져오기 함수
export async function getToken(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

// 삭제 함수
export async function deleteToken(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
