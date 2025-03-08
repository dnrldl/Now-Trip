import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addPost } from '../../../api/postApi';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { getPresignedUrl } from '../../../api/s3Api';
import axios from 'axios';
import { DataContext } from '../../../contexts/DataContext';

export default function AddPostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [iso2Code, setIso2Code] = useState(null); // 선택한 국가
  const [image, setImage] = useState(null); // 선택한 이미지
  const [imageType, setImageType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false); // 드롭다운 열기/닫기 상태
  const router = useRouter();
  const { countries } = useContext(DataContext);

  const sortedCountries = countries.sort((a, b) =>
    a.koreanName.localeCompare(b.koreanName)
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageType(result.assets[0].mimeType);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('게시글 오류', '제목과 내용을 입력해주세요.');
      return;
    }

    let uploadedImageUrl = null;

    try {
      if (image) {
        setUploading(true);

        const fileName = image.split('/').pop(); // test.jpg
        const { presignedUrl, fileUrl } = await getPresignedUrl(
          fileName,
          'uploads/'
        );

        const a = await fetch(image);
        const blob = await a.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        await axios.put(presignedUrl, arrayBuffer, {
          headers: {
            'Content-Type': imageType,
          },
        });
        uploadedImageUrl = fileUrl;
        console.log(fileUrl);
      }

      // 게시글 추가
      const response = await addPost({
        title,
        content,
        iso2Code,
        imageUrl: uploadedImageUrl,
      });

      console.log('게시글 작성 결과:', response);
      Alert.alert('게시글 등록', '게시글이 등록되었습니다.');
      router.dismiss();
    } catch (error) {
      console.warn('에러 발생:', error);
      if (error.details.title != null) {
        Alert.alert('제목 길이 오류', '제목은 최대 50자까지 입력 가능합니다!');
        return;
      }

      if (error.status === 401 || error.error == 'Unauthorized') {
        Alert.alert('세션 만료', '로그인이 필요합니다.');
        router.back();
      } else {
        Alert.alert('에러 발생', '게시글 작성 중 문제가 발생했습니다.');
      }
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
        onChangeText={(text) => setTitle(text)}
        autoCapitalize='none'
      />
      <DropDownPicker
        open={open}
        value={iso2Code}
        items={sortedCountries.map((item) => ({
          label: item.koreanName,
          value: item.iso2Code,
        }))}
        setOpen={setOpen}
        setValue={setIso2Code}
        placeholder='국가 선택'
        dropDownContainerStyle={styles.dropdownContainer}
        style={styles.dropdown}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder='내용을 입력하세요'
        value={content}
        onChangeText={(text) => setContent(text)}
        multiline
        autoCapitalize='none'
      />

      {/* 이미지 선택 버튼 */}
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>이미지 선택</Text>
      </TouchableOpacity>

      {/* 이미지 미리보기 */}
      {image && (
        <TouchableOpacity onLongPress={() => setImage(null)}>
          <Image
            source={{ uri: image }}
            style={styles.preview}
            resizeMode='cover'
          />
        </TouchableOpacity>
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  dropdown: {
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  preview: { width: '100%', height: 200, borderRadius: 8, marginVertical: 10 },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
