import { privateAxios, publicAxios } from './axiosInstance';
import handleError from './handleApiError';

const PATH = '/posts';

export const fetchPosts = async (page) => {
  try {
    const response = await publicAxios.get(PATH, {
      params: { page },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 특정 게시글 가져오기
export const fetchPost = async (postId) => {
  try {
    const response = await publicAxios.get(PATH + `/${postId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchMyPosts = async (page) => {
  try {
    const response = await privateAxios.get(PATH + '/myPosts', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 특정 게시글 댓글 가져오기
export const fetchComments = async (postId) => {
  try {
    const response = await publicAxios.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 게시글 작성 (로그인한 사용자만 가능)
export const addPost = async (postData) => {
  console.log(postData);
  try {
    const response = await privateAxios.post('/posts', postData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const addComment = async (postId, content) => {
  try {
    const response = await privateAxios.post(`/posts/${postId}/comments`, {
      content: content,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
