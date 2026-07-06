import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface ICookie {
  user: any;
  accessType: string;
  accessToken: string;
}

/**
 * Get server-side cookies for authentication
 * Returns null if any required cookie is missing or invalid
 */
export async function getServerSideCookies(): Promise<ICookie | null> {
  const cookieStore = await cookies();

  const userCookie = cookieStore.get('user');
  const accessTypeCookie = cookieStore.get('accessType');
  const accessTokenCookie = cookieStore.get('accessToken');

  if (!userCookie || !accessTypeCookie || !accessTokenCookie) {
    return null;
  }

  // Validate that cookies have values
  if (!userCookie.value || !accessTypeCookie.value || !accessTokenCookie.value) {
    return null;
  }

  try {
    const user = JSON.parse(userCookie.value);
    return {
      user,
      accessType: accessTypeCookie.value,
      accessToken: accessTokenCookie.value,
    };
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

/**
 * Get user object from cookies (server-side)
 * Returns null if not authenticated
 */
export async function getUser(): Promise<any | null> {
  const cookieData = await getServerSideCookies();
  return cookieData?.user || null;
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in server components/layouts to protect routes
 */
export async function requireAuth(): Promise<ICookie> {
  const cookieData = await getServerSideCookies();

  if (!cookieData || !cookieData.user || !cookieData.accessType || !cookieData.accessToken) {
    redirect('/auth/login');
  }

  return cookieData;
}

/**
 * Get authorized server data with optional callback
 * Redirects to login if not authenticated
 * @param callback Optional callback function that receives cookie data
 */
export async function getAuthorizedServer(
  callback?: (cookies: ICookie) => Promise<any>,
): Promise<any> {
  const cookieData = await requireAuth();

  let data = null;

  if (callback) {
    data = await callback(cookieData);
  }

  if (data && data.redirect) {
    redirect(data.redirect);
  }

  return data || {};
}
