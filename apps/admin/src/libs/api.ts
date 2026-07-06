import axios, { AxiosError, AxiosResponse } from 'axios';
import { apiBaseUrl as baseURL } from '../config/env';
import { showApiCallLoaderToast } from '../utils/toast';
import { getCookie } from './cookie';
import { destroyLogin } from './auth';

const instance = axios.create({
  baseURL,
  timeout: 300000,
  validateStatus: status => status >= 200 && status < 300, // Accept all 2xx status codes
});

instance.defaults.onDownloadProgress = progressEvent => {
  // increment((progressEvent.loaded / progressEvent.total) * 100);
};

instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent

    // console.debug('request -> config', config);

    return config;
  },
  function (error) {
    // Do something with request error

    console.error('request -> error', error);

    return Promise.reject(error);
  },
);

/**
 * API Response Structure matching backend TransformInterceptor
 * This interface matches the ApiResponse from the backend
 */
export interface IData {
  statusCode: number;
  message: string;
  data?: any;
  error?: any;
  timestamp: string;
  path?: string;
}

instance.interceptors.response.use(
  function (response: AxiosResponse): any {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    console.debug('api.ts -> response', response);
    console.debug('api.ts -> response -> data', response.data);

    // The backend returns { statusCode, message, data } structure
    // Return it directly as IData (this will be the resolved value of the promise)
    return response.data as IData;
  },
  function (error: AxiosError<AxiosResponse>): IData | Promise<never> {
    console.error('api.ts -> error', error);

    // Handle 401 Unauthorized - clear cookies and redirect to login
    if (error.response?.status === 401) {
      // Only handle on client side
      if (typeof window !== 'undefined') {
        destroyLogin();
        window.location.href = '/auth/login';
      }
    }

    // If error response has data, return it
    if (error.response?.data) {
      console.error('response -> error data', error.response.data);
      return Promise.reject(error.response.data);
    }

    // Fallback error structure for network errors
    return Promise.reject({
      statusCode: error.response?.status || 500,
      message: error.message || 'Network error occurred',
      error: null,
      timestamp: new Date().toISOString(),
    });
  },
);

const getHeaders = (authorization?: string | null, contentType?: string | null) => {
  // console.debug({ authorization, contentType });

  let authHeader: string | undefined = undefined;

  if (authorization) {
    authHeader = authorization;
  } else {
    const accessType = getCookie('accessType');
    const accessToken = getCookie('accessToken');

    if (accessType && accessToken) {
      // Ensure proper format: "Bearer <token>"
      authHeader = `${accessType} ${accessToken}`.trim();
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': !contentType ? 'application/json' : contentType,
  };

  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  return headers;
};

export const callPostApi = (
  url: string,
  payload: any,
  authorization?: string | null,
  contentType?: string | null,
  showLoader?: boolean,
): Promise<IData> => {
  // console.debug({ url, payload, headers: getHeaders(authorization, contentType) });

  const promise: Promise<IData> = instance.post(url, payload, {
    headers: getHeaders(authorization, contentType),
  });

  if (!showLoader) return promise;

  return showApiCallLoaderToast(promise, 'Posting data, please wait!', 'info');
};

export const callGetApi = (
  url: string,
  authorization?: string | null,
  showLoader?: boolean,
): Promise<IData> => {
  const promise: Promise<IData> = instance.get(url, {
    headers: getHeaders(authorization),
  });

  if (!showLoader) return promise;

  return showApiCallLoaderToast(promise, 'Fetching data, please wait!', 'info');
};

export const callPutApi = (
  url: string,
  payload: any,
  authorization?: string | null,
  contentType?: string | null,
  showLoader?: boolean,
): Promise<IData> => {
  const promise: Promise<IData> = instance.put(url, payload, {
    headers: getHeaders(authorization, contentType),
  });

  if (!showLoader) return promise;

  return showApiCallLoaderToast(promise, 'Updating data, please wait!', 'info');
};

export const callDeleteApi = (
  url: string,
  authorization?: string | null,
  showLoader?: boolean,
): Promise<IData> => {
  const promise: Promise<IData> = instance.delete(url, {
    headers: getHeaders(authorization),
  });

  if (!showLoader) return promise;

  return showApiCallLoaderToast(promise, 'Deleting, please wait!', 'info');
};
