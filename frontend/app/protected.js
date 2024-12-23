import React from 'react';
import { View, Text, Button } from 'react-native';
import { useContext } from 'react';
import { withAuth } from '../middleware/middleware';
import { AuthContext } from '../context/AuthContext';

const ProtectedScreen = () => {
  const { logout } = useContext(AuthContext);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>이곳은 보호된 경로입니다!</Text>
      <Button title='로그아웃' onPress={logout} />
    </View>
  );
};

export default withAuth(ProtectedScreen);
