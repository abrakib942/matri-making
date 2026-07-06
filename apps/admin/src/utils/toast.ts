import { toast, ToastContent, ToastOptions, TypeOptions, Zoom } from 'react-toastify';
import { IData } from '../libs/api';

const toastOptions: ToastOptions = {
  position: 'bottom-right',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: 0,
  theme: 'colored',
  transition: Zoom,
};

export const showToast = (message: ToastContent, type: TypeOptions, options?: ToastOptions) => {
  toast(message, { ...toastOptions, ...options, type });
};

export const showApiCallLoaderToast = (
  promise: Promise<IData>,
  pendingMessage: string,
  type: TypeOptions,
  options?: ToastOptions,
): Promise<IData> => {
  const toastId = Math.floor(Math.random() * (9999 - 9 + 1)) + 9;
  toast.loading(pendingMessage, {
    ...toastOptions,
    ...options,
    autoClose: false,
    isLoading: true,
    type,
    toastId,
  });

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      promise
        .then(response => {
          // Dismiss loading toast first
          toast.dismiss(toastId);

          // Show success or error toast based on status code
          if (response.statusCode === 200) {
            toast.success(response.message || 'Operation successful', {
              ...toastOptions,
              ...options,
              autoClose: 3000,
            });
          } else {
            toast.error(response.message || 'Operation failed', {
              ...toastOptions,
              ...options,
              autoClose: 5000,
            });
          }

          resolve(response);
        })
        .catch(error => {
          console.error('toast.ts -> error', error);

          // Dismiss loading toast
          toast.dismiss(toastId);

          // Show error toast
          toast.error(error.message || 'Something went wrong!', {
            ...toastOptions,
            ...options,
            autoClose: 5000,
          });

          reject(error);
        });
    }, 500);
  });
};

export const showPromisifyToast = (
  promise: Promise<any>,
  messages: {
    pending: string;
    success: string;
    error: string;
  },
  type: TypeOptions,
  options?: ToastOptions,
) => {
  return toast.promise(promise, messages, { ...toastOptions, ...options, type });
};
