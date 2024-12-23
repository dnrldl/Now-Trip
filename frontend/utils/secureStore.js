import * as SecureStore from 'expo-secure-store';

// 저장 함수
export async function saveToken(key, value) {
  await SecureStore.setItemAsync(key, value);
}

// 가져오기 함수
export async function getToken(key) {
  return await SecureStore.getItemAsync(key);
}

// 삭제 함수
export async function deleteToken(key) {
  await SecureStore.deleteItemAsync(key);
}
