import { View, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { SvgUri } from 'react-native-svg';

const FlagImage = ({ countryCode }) => {
  const [localUri, setLocalUri] = useState(null);
  const cdnBaseUrl = 'https://d3kl0w556e4fca.cloudfront.net/flags';
  const imageUrl = `${cdnBaseUrl}/${countryCode}.png`;
  const localFilePath = `${FileSystem.documentDirectory}${countryCode}.png`;

  const downloadImage = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localFilePath);

      if (fileInfo.exists) {
        setLocalUri(localFilePath);
        console.log('캐시된 이미지 파일 사용');
        return;
      }

      console.log(`${imageUrl} 를 ${localFilePath} 에 다운로드중..`);
      const { uri } = await FileSystem.downloadAsync(imageUrl, localFilePath);

      setLocalUri(uri);
    } catch (error) {
      console.error('이미지 다운로드중 에러:', error);
    }
  };

  useEffect(() => {
    downloadImage();
  }, []);

  if (!localUri) return null;

  return (
    <Image
      source={{ uri: localUri }}
      style={{ width: '100%', height: '100%' }}
      resizeMode='center'
    />
  );
};

export const clearAllFiles = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    );
    for (const file of files) {
      const filePath = `${FileSystem.documentDirectory}${file}`;
      console.log(`🗑 삭제 중: ${filePath}`);
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    }

    console.log('✅ 모든 파일이 삭제되었습니다.');
  } catch (error) {
    console.error('🚨 파일 삭제 중 오류 발생:', error);
  }
};

export default FlagImage;
