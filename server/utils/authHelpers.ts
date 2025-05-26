// /server/utils/authenticateAppUserJWT.ts
import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { getJwtSecret } from './authConfig';

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
    const JWT_SECRET = getJwtSecret();
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.user_type !== 'app_user' || !decoded.app_user_id) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Not an app_user or invalid token type.' });
    }

    event.context.user = decoded;
  } catch (err: any) {
    console.error('JWT verification failed:', err);
    throw createError({ statusCode: 403, statusMessage: 'Invalid or expired token.' });
  }
}
