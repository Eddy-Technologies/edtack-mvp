// /server/api/app-auth/test-jwt.get.ts
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../utils/authConfig'; // Import JWT_SECRET from authConfig

// Use a simple, hardcoded secret for this test.
// For HS256 (default), the secret should ideally be a strong, random string.
// The length matters for security, but for this test, a simple string will do.
const TEST_JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

export default defineEventHandler(() => {
  console.log('[test-jwt.get.ts] Attempting to sign and verify JWT...');
  try {
    const payload = { userId: 'testUser123', data: 'sample-data' };

    console.log('[test-jwt.get.ts] Signing token...');
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1m' });
    console.log('[test-jwt.get.ts] Token signed:', !!token);

    console.log('[test-jwt.get.ts] Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[test-jwt.get.ts] Token verified. Decoded:', decoded);

    return {
      success: true,
      message: 'jsonwebtoken sign and verify test successful.',
      tokenGenerated: !!token,
      decodedPayload: decoded,
    };
  } catch (error: any) {
    console.error('[test-jwt.get.ts] JWT Test Error:', error.message);
    console.error('[test-jwt.get.ts] JWT Test Error Stack:', error.stack);
    // Return a more detailed error for debugging
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
});
