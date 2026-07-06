// third-party
import { GetServerSidePropsContext } from 'next';

// application
import { getCookie, getServerSideCookie, hasCookie, removeCookie, setCookie } from './cookie';

export interface ICookie {
  user: any;
  accessType: string;
  accessToken: string;
}

export const getUser = () => JSON.parse(getCookie('user'));
export const setUser = (value: string) => setCookie('user', JSON.stringify(value));
export const getAccessType = () => getCookie('accessType');
export const setAccessType = (value: string) => setCookie('accessType', value);
export const getAccessToken = () => getCookie('accessToken');
export const setAccessToken = (value: string) => setCookie('accessToken', value);

export const createLogin = (user: any, accessType: string, accessToken: string): boolean => {
  // console.debug({ user, accessType, accessToken });

  try {
    setUser(user);
    setAccessType(accessType);
    setAccessToken(accessToken);

    return true;
  } catch (error) {
    console.error('error', error);

    return false;
  }
};

export const isLoggedIn = () =>
  hasCookie('user') && hasCookie('accessType') && hasCookie('accessToken');

export const destroyLogin = (): boolean => {
  try {
    removeCookie('user');
    removeCookie('accessType');
    removeCookie('accessToken');

    return true;
  } catch (error) {
    console.error('error', error);

    return false;
  }
};

export const getServerSideCookies = (context: GetServerSidePropsContext): ICookie | null => {
  if (!context) return null;

  if (!context.req) return null;

  if (!context.req.headers) return null;

  if (!context.req.headers.cookie) return null;

  const user = getServerSideCookie('user', context.req.headers.cookie);
  const accessType = getServerSideCookie('accessType', context.req.headers.cookie);
  const accessToken = getServerSideCookie('accessToken', context.req.headers.cookie);

  return {
    user,
    accessType,
    accessToken,
  };
};

export const getAuthorized = async (
  context: GetServerSidePropsContext,
  title: string,
  callback?: (cookies: any) => any,
) => {
  if (!context)
    return {
      redirect: {
        destination: '/500',
        permanent: false,
      },
    };

  const cookies = getServerSideCookies(context);

  // console.debug({ cookies });

  if (!cookies || !cookies.user || !cookies.accessType || !cookies.accessToken) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  let data = null;

  if (callback) data = await callback(cookies);

  if (data && data.redirect) return { redirect: data.redirect };

  return {
    props: data ? { title, ...data } : { title },
  };
};
