import { privateAxios, publicAxios } from './axiosInstance';

export const fetchPosts = async (page) => {
  try {
    const response = await publicAxios.get('/posts', {
      params: { page, size: 10 },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

// 게시글 작성 (로그인한 사용자만 가능)
export const addPost = async (postData) => {
  try {
    const response = await privateAxios.post('/posts', postData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};
