import axios, { AxiosProgressEvent } from 'axios';
import { apiBaseUrl, storageBaseUrl } from '../config/env';
import { callGetApi, callPostApi, callPutApi } from '../libs/api';
import { getCookie } from '../libs/cookie';

export const login = (payload: { email: string; password: string }) =>
  callPostApi(apiBaseUrl + '/api/v1/auth/sign-in', payload, null, null, true);

export const resetPassword = () => {};

export const getModuleNames = () => callGetApi(apiBaseUrl + '/api/v1/permission-modules');

export const getPermissionTypes = () => callGetApi(apiBaseUrl + '/api/v1/permission-types');

export const getPermissionCatalog = () => callGetApi(apiBaseUrl + '/api/v1/permissions/catalog');

export const getRoles = () => callGetApi(apiBaseUrl + '/api/v1/roles');

export const getRoleById = (roleId: number | string) =>
  callGetApi(apiBaseUrl + `/api/v1/roles/${roleId}`);

export const updateRolePermissions = (
  roleId: number | string,
  payload: { permissionIds: number[] },
) =>
  callPutApi(
    apiBaseUrl + `/api/v1/roles/${roleId}/permissions`,
    payload,
    null,
    'application/json',
    true,
  );

export const getFolderById = (folderId: number) =>
  callGetApi(apiBaseUrl + '/api/v1/folders/' + folderId);

export const getProfile = (authorization: string) =>
  callGetApi(apiBaseUrl + `/api/v1/user-profile`, authorization);

export interface UploadFileToStorageOptions {
  file: File;
  fileName?: string;
  onUploadProgress?: (progress: number) => void;
}

export interface UploadFileResponse {
  url: string;
  localUrl: string;
}

export const uploadFileToStorage = async ({
  file,
  fileName,
  onUploadProgress,
}: UploadFileToStorageOptions): Promise<UploadFileResponse> => {
  if (!storageBaseUrl) {
    throw new Error('Storage base URL is not set');
  }

  const formData = new FormData();
  formData.append('file', file);

  if (fileName) {
    formData.append('fileName', fileName);
  }

  // Get auth headers
  const accessType = getCookie('accessType');
  const accessToken = getCookie('accessToken');
  const authHeader = accessType && accessToken ? `${accessType} ${accessToken}`.trim() : undefined;

  const headers: Record<string, string> = {};
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const response = await axios.post<{
    statusCode: number;
    data: UploadFileResponse;
    message: string;
  }>(`${storageBaseUrl}/files`, formData, {
    headers,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(progress);
      }
    },
  });

  if (response.data.statusCode === 200 && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'File upload failed');
};

export const deleteFileFromStorage = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) {
    throw new Error('File URL is required');
  }

  if (!storageBaseUrl) {
    throw new Error('Storage base URL is not set');
  }

  const accessType = getCookie('accessType');
  const accessToken = getCookie('accessToken');
  const authHeader = accessType && accessToken ? `${accessType} ${accessToken}`.trim() : undefined;

  const headers: Record<string, string> = {};
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const isAbsolute = /^https?:\/\//i.test(fileUrl);
  const normalizedBase = storageBaseUrl.replace(/\/$/, '');
  const normalizedPath = fileUrl.replace(/^\//, '');
  const deleteUrl = isAbsolute ? fileUrl : `${normalizedBase}/${normalizedPath}`;

  const response = await axios.delete<{
    statusCode: number;
    data: null;
    message: string;
  }>(deleteUrl, { headers });

  if (response.data.statusCode !== 200) {
    throw new Error(response.data.message || 'File deletion failed');
  }
};
