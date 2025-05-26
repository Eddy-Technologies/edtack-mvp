// /server/api/app-auth/test-jwt.get.ts

// import jwt from 'jsonwebtoken'; // Commented out the real import
import { JWT_SECRET } from '../../utils/authConfig'; // Import JWT_SECRET from authConfig

// Stub version of jwt for testing without actual token logic
const jwtStub = {
  sign: (payload: any, secretOrPrivateKey: any, options?: any): string => {
    console.log('[test-jwt.get.ts STUB] jwt.sign called with payload:', payload, 'options:', options);
    return 'fake-jwt-token-for-stubbing-purposes-' + Date.now();
  },
  verify: (token: string, secretOrPublicKey: any, options?: any): object | string => {
    console.log('[test-jwt.get.ts STUB] jwt.verify called with token:', token ? 'present' : 'missing', 'options:', options);
    return { userId: 'stubbed-test-user', data: 'stubbed-sample-data', verifiedAt: new Date().toISOString() };
  },
};

export default defineEventHandler(() => {
  console.log('[test-jwt.get.ts] Attempting to sign and verify JWT (STUB)...');
  try {
    const payload = { userId: 'testUser123', data: 'sample-data' };

    console.log('[test-jwt.get.ts] Signing token...');
    const token = jwtStub.sign(payload, JWT_SECRET, { expiresIn: '1m' });
    console.log('[test-jwt.get.ts] Token signed:', token);

    console.log('[test-jwt.get.ts] Verifying token...');
    const decoded = jwtStub.verify(token, JWT_SECRET);
    console.log('[test-jwt.get.ts] Token verified. Decoded:', decoded);

    return {
      success: true,
      message: 'jsonwebtoken sign and verify test successful (using stub).',
      tokenGenerated: token,
      decodedPayload: decoded,
    };
  } catch (error: any) {
    console.error('[test-jwt.get.ts] JWT Test Error:', error.message);
    console.error('[test-jwt.get.ts] JWT Test Error Stack:', error.stack);
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
});
