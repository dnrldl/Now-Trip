import React, { useState } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

export default function PostImage({ uri }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* 게시글 이미지 */}
      <TouchableOpacity onPress={() => setVisible(true)}>
        {loading && (
          <ActivityIndicator size='small' color='#000' style={styles.loader} />
        )}
        <Image
          source={
            error
              ? require('../assets/images/favicon.png') // 실패 시 기본 이미지
              : { uri }
          }
          style={styles.image}
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
        />
      </TouchableOpacity>

      {/* 이미지 상세 */}
      <ImageViewing
        images={[{ uri }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
    </View>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: SCREEN_WIDTH - 30,
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
});
