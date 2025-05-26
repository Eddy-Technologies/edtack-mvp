import jwt from 'jsonwebtoken'; // Comment out the real import
import type { H3Event } from 'h3';
import { JWT_SECRET } from './authConfig'; // Import JWT_SECRET from authConfig

// Define a stub for jwt
const jwtStub = {
  sign: (payload: any, secretOrPrivateKey: any, options?: any): string => {
    console.log('[AuthHelpers_STUB] jwt.sign called with payload:', payload, 'options:', options);
    // Return a consistent, fake token. This is not a real JWT.
    return 'fake-jwt-token-for-stubbing-purposes-' + Date.now();
  },
  verify: (token: string, secretOrPublicKey: any, options?: any): object | string => {
    console.log('[AuthHelpers_STUB] jwt.verify called with token:', token ? 'present' : 'missing', 'options:', options);
    // Return a consistent, fake decoded payload.
    // This should match the structure of what your actual jwt.sign creates.
    return { app_user_id: 'stubbed-app-user-id-' + Date.now(), username: 'stubbed_username', user_type: 'app_user' };
  },
};

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
    const decoded: any = jwtStub.verify(token, JWT_SECRET); // Use STUB
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

  const token = jwtStub.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' }); // Use STUB

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
    const decoded = jwtStub.verify(token, JWT_SECRET) as AppUserJWTPayload; // Use STUB
    console.log('[AuthHelpers] App user JWT cookie verified.');
    return decoded;
  } catch (err: any) {
    console.error('[AuthHelpers] App user JWT cookie verification failed:', err.message);
    // Clear the invalid cookie
    setCookie(event, 'app_user_jwt', '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax' });
    throw createError({ statusCode: 403, statusMessage: 'Invalid or expired app user session (cookie).' });
  }
}
