// /server/api/app-auth/test-jwt.get.ts
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../../utils/authConfig';

export default defineEventHandler(() => {
  console.log('[test-jwt.get.ts] Attempting to sign and verify JWT...');
  try {
    const JWT_SECRET = getJwtSecret();
    const payload = { userId: 'testUser123', data: 'sample-data' };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1m' });
    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      success: true,
      message: 'jsonwebtoken sign and verify test successful.',
      tokenGenerated: !!token,
      decodedPayload: decoded,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
});
