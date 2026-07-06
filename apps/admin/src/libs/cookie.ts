import Cookies, { CookieGetOptions, CookieSetOptions } from 'universal-cookie';

// Function to get a cookie by name
export function getCookie(name: string, options?: CookieGetOptions) {
  const cookies = new Cookies();

  return cookies.get(name, { ...options });
}

export function getServerSideCookie(name: string, serverCookie: any, options?: CookieSetOptions) {
  const cookies = new Cookies(serverCookie, { path: '/', ...options });

  return cookies.get(name);
}

// Function to set a cookie
export function setCookie(name: string, value: string, options?: CookieSetOptions) {
  const cookies = new Cookies();

  // Set secure cookies with proper options
  const defaultOptions: CookieSetOptions = {
    path: '/',
    sameSite: 'lax',
    // Don't set httpOnly for client-side access, but set secure in production
    secure: process.env.NODE_ENV === 'production',
    ...options,
  };

  cookies.set(name, value, defaultOptions);
}

// Function to remove a cookie by name
export function removeCookie(name: string, options?: CookieSetOptions) {
  const cookies = new Cookies();

  cookies.remove(name, { path: '/', ...options });
}

// Function to check if a cookie with a given name exists
export function hasCookie(name: string, options?: CookieGetOptions) {
  return getCookie(name, { ...options }) !== undefined;
}

// Function to get all cookies
export function getAllCookies() {
  const cookies = new Cookies();

  return cookies.getAll();
}
