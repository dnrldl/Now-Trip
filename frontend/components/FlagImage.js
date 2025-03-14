import { Image, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';

const FlagImage = ({ countryCode, size = 50, style }) => {
  const [localUri, setLocalUri] = useState(null);
  const cdnBaseUrl = process.env.EXPO_PUBLIC_CDN_FLAG_URL;
  const imageUrl = `${cdnBaseUrl}/${countryCode.toLowerCase()}.png`;
  const localFilePath = `${
    FileSystem.documentDirectory
  }${countryCode.toLowerCase()}.png`;

  const downloadImage = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localFilePath);

      if (fileInfo.exists) {
        console.log('캐시된 이미지 사용');
        setLocalUri(localFilePath);
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
    <View style={[styles.imageContainer, { width: size, height: size }]}>
      <Image
        source={{ uri: localUri }}
        style={[styles.image, { width: size, height: size }, style]}
        resizeMode='cover'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 50, // 원형으로 만들기
    overflow: 'hidden', // 둥근 테두리를 유지하기 위해 필요
    backgroundColor: '#f0f0f0', // 이미지 로드 전 배경색 설정 (선택 사항)
  },
  image: {
    borderRadius: 50, // 원형 적용
  },
});

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
