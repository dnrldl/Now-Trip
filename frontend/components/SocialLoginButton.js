import { TouchableOpacity, Image } from 'react-native';
import React from 'react';

const images = {
  google: require('../assets/images/btn_google.png'),
  naver: require('../assets/images/btn_naver.png'),
};

export default function SocialLoginButton({ platform, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={images[platform]}
        style={{ width: 50, height: 50 }}
        resizeMode='contain'
      />
    </TouchableOpacity>
  );
}
