import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
// import { JWT_SECRET } from './authConfig'; // Import JWT_SECRET from authConfig

const JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64-char hex fallback

// Helper function to authenticate requests based on the custom JWT issued for 'app_users'.
// It's designed to be used before handlers that require an authenticated 'app_user'.
export async function authenticateAppUserJWT(event: H3Event) {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header missing.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token missing.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET); // Use imported JWT_SECRET
    // Ensure the token is for an 'app_user' and contains the app_user_id
    if (decoded.user_type !== 'app_user' || !decoded.app_user_id) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Not an app_user or invalid token type.' });
    }
    // Attach decoded user information to the event context for access in the main handler
    event.context.user = decoded;
  } catch (err: any) {
    console.error('JWT verification failed:', err);
    throw createError({ statusCode: 403, statusMessage: 'Invalid or expired token.' });
  }
}

interface AppUserJWTPayload {
  app_user_id: string;
  username: string;
  user_type: 'app_user';
  // Add any other standard claims you might include, e.g., iat, exp (though exp is handled by options)
}

// Helper function to sign a JWT for an app_user and set it as an HttpOnly cookie
export function signAndSetAppUserCookie(event: H3Event, payload: Omit<AppUserJWTPayload, 'user_type'>): string {
  if (!JWT_SECRET) {
    console.error('[AuthHelpers] JWT_SECRET is not defined. Cannot sign token.');
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error: JWT signing secret missing.' });
  }

  const tokenPayload: AppUserJWTPayload = {
    ...payload,
    user_type: 'app_user',
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  setCookie(event, 'app_user_jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'lax',
  });
  console.log('[AuthHelpers] App user JWT cookie set.');
  return token;
}

// Helper function to verify the app_user_jwt cookie and return the decoded payload
export function verifyAppUserCookieAndGetPayload(event: H3Event): AppUserJWTPayload {
  const token = getCookie(event, 'app_user_jwt');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'No app user session found (cookie missing).' });
  }

  if (!JWT_SECRET) {
    console.error('[AuthHelpers] JWT_SECRET is not defined. Cannot verify token.');
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error: JWT signing secret missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AppUserJWTPayload;
    console.log('[AuthHelpers] App user JWT cookie verified.');
    return decoded;
  } catch (err: any) {
    console.error('[AuthHelpers] App user JWT cookie verification failed:', err.message);
    // Clear the invalid cookie
    setCookie(event, 'app_user_jwt', '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax' });
    throw createError({ statusCode: 403, statusMessage: 'Invalid or expired app user session (cookie).' });
  }
}
