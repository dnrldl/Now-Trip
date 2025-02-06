import React, { useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addPost } from '../../../api/postApi';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { getPresignedUrls } from '../../../api/s3Api';
import axios from 'axios';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AddPostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [iso3Code, setIso3Code] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const countries = [
    { countryName: 'Japan', iso3Code: 'JPN' },
    { countryName: 'Korea', iso3Code: 'KOR' },
  ];

  // 📌 이미지 선택 (여러 개 선택 가능)
  const pickImage = async () => {
    let results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      aspect: [4, 5],
      quality: 1,
    });

    if (!results.canceled) {
      const selectedImages = results.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType,
        fileName: asset.uri.split('/').pop(),
      }));
      setImages([...images, ...selectedImages]);
    }
  };

  // 📌 이미지 삭제 기능 (길게 누르면 삭제됨)
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  // 📌 게시글 등록
  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('게시글 오류', '제목과 내용을 입력해주세요.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('이미지 오류', '적어도 한 개의 이미지를 업로드해주세요.');
      return;
    }

    setUploading(true);
    try {
      const fileNames = images.map((img) => img.fileName);
      const presignedUrls = await getPresignedUrls(fileNames);

      const uploadedImageUrls = [];
      for (const image of images) {
        const presignedUrl = presignedUrls[image.fileName];
        if (!presignedUrl) {
          console.error('Presigned URL을 찾을 수 없습니다.');
          return;
        }

        const file = await fetch(image.uri);
        const blob = await file.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        await axios.put(presignedUrl, arrayBuffer, {
          headers: { 'Content-Type': image.type },
        });

        uploadedImageUrls.push(presignedUrls.fileUrls[image.fileName]);
      }

      const response = await addPost({
        title,
        content,
        iso3Code,
        imageUrls: uploadedImageUrls,
      });

      Alert.alert('게시글 등록', '게시글이 등록되었습니다.');
      router.dismiss();
    } catch (error) {
      console.warn('에러 발생:', error);
      Alert.alert('에러 발생', '게시글 작성 중 문제가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>새로운 게시글</Text>
      <TextInput
        style={styles.input}
        placeholder='제목을 입력하세요'
        value={title}
        onChangeText={setTitle}
        autoCapitalize='none'
      />
      <DropDownPicker
        open={open}
        value={iso3Code}
        items={countries.map((item) => ({
          label: item.countryName,
          value: item.iso3Code,
        }))}
        setOpen={setOpen}
        setValue={setIso3Code}
        placeholder='국가 선택'
        dropDownContainerStyle={styles.dropdownContainer}
        style={styles.dropdown}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder='내용을 입력하세요'
        value={content}
        onChangeText={setContent}
        multiline
        autoCapitalize='none'
      />

      {/* 이미지 선택 버튼 */}
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>이미지 선택</Text>
      </TouchableOpacity>

      {/* 이미지 미리보기 슬라이더 */}
      {images.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            decelerationRate='fast'
            snapToAlignment='center'
            snapToInterval={SCREEN_WIDTH - 40}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onLongPress={() => removeImage(index)}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.postImage}
                  resizeMode='cover'
                />
              </TouchableOpacity>
            )}
            viewabilityConfigCallbackPairs={
              viewabilityConfigCallbackPairs.current
            }
          />

          {/* 슬라이드 인디케이터 */}
          <View style={styles.indicatorContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      index === currentIndex ? '#007BFF' : '#ccc',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* 게시글 등록 버튼 */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? '업로드 중...' : '등록'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 5,
  },
  dropdown: { marginBottom: 5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 5,
  },
  imageButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  imagePreviewContainer: { alignItems: 'center' },
  postImage: {
    width: SCREEN_WIDTH - 40,
    height: 300,
    borderRadius: 8,
    margin: 5,
  },
  indicatorContainer: { flexDirection: 'row' },
  indicator: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
