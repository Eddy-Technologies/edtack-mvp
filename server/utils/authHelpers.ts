import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './authConfig'; // Import JWT_SECRET from authConfig

// Helper function to authenticate requests based on the custom JWT issued for 'app_users'.
// It's designed to be used before handlers that require an authenticated 'app_user'.
export async function authenticateAppUserJWT(event: any) {
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
