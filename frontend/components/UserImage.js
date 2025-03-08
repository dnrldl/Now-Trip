import React from 'react';
import { Image } from 'react-native';

export default function UserImage({ uri, size = 80 }) {
  const isValidUri = uri && typeof uri === 'string' && uri.startsWith('http');
  const image = require('../assets/images/default_user_icon.png');

  return (
    <Image
      source={isValidUri ? { uri } : image}
      style={{
        width: size,
        height: size,
        borderRadius: 40,
        marginRight: 15,
        resizeMode: 'cover',
        borderWidth: 0.5,
        borderColor: '#000',
      }}
    />
  );
}
