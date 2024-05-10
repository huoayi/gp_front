import request, { configRequest } from '@/utils/request';
import type { AxiosRequestConfig } from 'axios';

// 记录用户上传文件
export function getCloudFiles(user_id: string) {
  return request.$Axios.get('/cloud-files', { user_id });
}

export function setUploadedFile(data: { user_id: string; name: string; icon?: string; size: number; md5: string }) {
  return request.$Axios.post('/cloud-files', data);
}

export function deleteUploadedFiles(file_ids: string[]) {
  return request.$Axios.del('/cloud-files', { file_ids });
}

export function getCloudSpace(user_id: string) {
  return request.$Axios.get('/cloud-files/user-space', { user_id });
}

// 云盘上传
const diskRequest = configRequest({ baseurl: import.meta.env.VITE_APP_DISK_URL });
const uploadRequest = configRequest({
  headers: { 'Content-Type': 'multipart/form-data' },
  baseurl: import.meta.env.VITE_APP_DISK_URL,
});

export function checkFile(filehash: string, isAborted?: boolean) {
  diskRequest.isRequestAborted = isAborted || false;
  return diskRequest.$Axios.get(`/check/${filehash}`);
}

// 云盘 - 文件列表
export function browseFiles() {
  return diskRequest.$Axios.get('/browse');
}

// 下载
export function downloadFile(filehash: string) {
  return diskRequest.$Axios.get(`/download/${filehash}`);
}

// 删除
export function deleteFile(filehash: string) {
  return diskRequest.$Axios.post(`/delete/${filehash}`);
}

// 分片列表
export function getUploadedChunks(filehash: string, isAborted?: boolean) {
  diskRequest.isRequestAborted = isAborted || false;
  return diskRequest.$Axios.get(`/slice-list/${filehash}`);
}

// 上传
export function uploadFile(
  data: { filehash: string; file: File | Blob; onProgress?: AxiosRequestConfig['onUploadProgress'] },
  isAborted?: boolean,
) {
  const { filehash, file, onProgress } = data;
  uploadRequest.isRequestAborted = isAborted || false;
  return uploadRequest.$Axios.post(`/upload/${filehash}`, { file }, { onUploadProgress: onProgress });
}

// 分片上传
export function preUploadFile(filehash: string, isAborted?: boolean) {
  uploadRequest.isRequestAborted = isAborted || false;
  return uploadRequest.$Axios.post(`/pre-upload/${filehash}`);
}

export function uploadChunk(
  data: {
    filehash: string;
    index: number;
    file: File | Blob;
    onProgress?: AxiosRequestConfig['onUploadProgress'];
  },
  isAborted?: boolean,
) {
  const { filehash, index, file, onProgress } = data;
  uploadRequest.isRequestAborted = isAborted || false;
  return uploadRequest.$Axios.post(`/slice-upload/${filehash}/${index}`, { file }, { onUploadProgress: onProgress });
}

export function checkChunk(params: { filehash: string; index: number }, isAborted?: boolean) {
  const { filehash, index } = params;
  uploadRequest.isRequestAborted = isAborted || false;
  return uploadRequest.$Axios.get(`/slice-check/${filehash}/${index}`);
}

export function mergeChunks(data: { filehash: string; total: number }, isAborted?: boolean) {
  const { filehash, total } = data;
  uploadRequest.isRequestAborted = isAborted || false;
  return uploadRequest.$Axios.post(`/compose/${filehash}/${total}`);
}
