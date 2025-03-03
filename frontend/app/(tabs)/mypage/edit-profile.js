import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { updateProfile } from '../../../api/userApi';
import { getPresignedUrl } from '../../../api/s3Api';
import axios from 'axios';

export default function EditProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imageType, setImageType] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setImageType(result.assets[0].mimeType);
    }
  };

  const handleSave = async () => {
    let uploadedImageUrl = null;

    try {
      if (profileImage) {
        setUploading(true);

        const fileName = profileImage.split('/').pop(); // test.jpg
        const { presignedUrl, fileUrl } = await getPresignedUrl(
          fileName,
          'profiles/'
        );

        const a = await fetch(profileImage);
        const blob = await a.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        await axios.put(presignedUrl, arrayBuffer, {
          headers: {
            'Content-Type': imageType,
          },
        });
        uploadedImageUrl = fileUrl;
      }

      const response = await updateProfile({
        nickname,
        profile: uploadedImageUrl,
      });

      console.log('결과: ', response);
      Alert.alert('프로필 변경', '프로필이 성공적으로 수정되었습니다.');
      router.back();
    } catch (error) {
      Alert.alert('오류 발생', '프로필 업데이트 중 문제가 발생했습니다.');
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 편집</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.completeText}>
            {uploading ? '업로드 중...' : '완료'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 프로필 사진 변경 */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri: profileImage || 'https://via.placeholder.com/100',
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={styles.changeImageButton}>
          <Text style={styles.changeImageText}>프로필 사진 변경</Text>
        </TouchableOpacity>
      </View>

      {/* 닉네임 입력 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          placeholder='새 닉네임 입력'
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize='none'
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cancelText: {
    fontSize: 16,
    color: '#007BFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changeImageButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
  },
});
