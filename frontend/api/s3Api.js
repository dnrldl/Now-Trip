import axios from 'axios';
import { privateAxios } from './axiosInstance';
import handleError from './handleApiError';

const PATH = '/s3';

export const getPresignedUrl = async (fileName, path) => {
  try {
    const response = await privateAxios.post(PATH + '/presigned-url', {
      fileName,
      path,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
