import React from 'react';
import { Image } from 'react-native';

export default function UserImage({ uri, size = 80 }) {
  const isValidUri = uri && typeof uri === 'string' && uri.startsWith('http');
  const defaultImage = require('../assets/images/default_user_icon.png');

  return (
    <Image
      source={isValidUri ? { uri } : defaultImage}
      style={{
        width: size,
        height: size,
        borderRadius: 40,
        marginRight: 15,
        resizeMode: 'cover',
        borderWidth: 0.5,
        borderColor: '#999',
      }}
    />
  );
}
