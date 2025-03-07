import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MyPosts from './MyPosts';
import MyFavorites from './MyFavorites';

const Tab = createMaterialTopTabNavigator();

export default function MyPageTabs() {
  return (
    <Tab.Navigator
      style={{
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'white',
      }}
    >
      <Tab.Screen name='내 게시글' component={MyPosts} />
      <Tab.Screen name='즐겨찾기' component={MyFavorites} />
    </Tab.Navigator>
  );
}
