import React from 'react';
import { Button } from 'react-native';
import { useLogout } from '../api/auth';

export default function LogoutButton() {
  const logout = useLogout(); // 훅을 호출하여 logout 함수를 가져옴

  return <Button title='로그아웃' onPress={logout} />;
}
