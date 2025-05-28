// /server/api/app-auth/__tests__/login.post.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';
import loginHandler from '../login.post';
import { privilegedSupabaseClientStub } from '../../../utils/__tests__/authConfig.test';

// Mock dependencies
vi.mock('../../../utils/authConfig', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getSupabaseClient: vi.fn(() => privilegedSupabaseClientStub), // Mock getSupabaseClient
    JWT_SECRET: 'test-secret-from-mock', // Provide a mock JWT_SECRET if not importing actual
  };
});

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readBody: vi.fn(),
    setCookie: vi.fn(),
    createError: vi.fn((err) => { throw err; }),
  };
});

vi.mock('bcryptjs', () => ({
  default: { // Assuming bcryptjs is imported as default
    compare: vi.fn(),
  }
}));

vi.mock('jsonwebtoken', () => ({
  default: { // Assuming jsonwebtoken is imported as default
    sign: vi.fn(),
  }
}));

describe('POST /api/app-auth/login', () => {
  let mockEvent: H3Event;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = {
      context: {},
    } as unknown as H3Event;

    // Reset stubs/mocks
    vi.mocked(privilegedSupabaseClientStub.from('app_users').select().eq().single).mockResolvedValue({ data: null, error: null });
    vi.mocked(require('bcryptjs').default.compare).mockResolvedValue(false);
    vi.mocked(require('jsonwebtoken').default.sign).mockReturnValue('mocked-jwt-token');
  });

  it('should return 400 if username or password is not provided', async () => {
    vi.mocked(readBody).mockResolvedValueOnce({ username: 'test' }); // Missing password
    await expect(loginHandler(mockEvent))
      .rejects.toMatchObject({ statusCode: 400, statusMessage: 'Username and password are required.' });

    vi.mocked(readBody).mockResolvedValueOnce({ password: 'password' }); // Missing username
    await expect(loginHandler(mockEvent))
      .rejects.toMatchObject({ statusCode: 400, statusMessage: 'Username and password are required.' });
  });

  it('should successfully login with correct credentials and set cookie', async () => {
    const username = 'testuser';
    const password = 'password123';
    const appUser = { id: 'app-user-1', username, encrypted_password: 'hashed_password' };

    vi.mocked(readBody).mockResolvedValueOnce({ username, password });
    vi.mocked(privilegedSupabaseClientStub.from('app_users').select().eq().single).mockResolvedValueOnce({ data: appUser, error: null });
    vi.mocked(require('bcryptjs').default.compare).mockResolvedValueOnce(true);
    vi.mocked(require('jsonwebtoken').default.sign).mockReturnValueOnce('signed-jwt-token');

    const response = await loginHandler(mockEvent);

    expect(response).toEqual({ message: 'Username login successful!', user: { id: appUser.id, username: appUser.username } });
    expect(require('jsonwebtoken').default.sign).toHaveBeenCalledWith(
      { app_user_id: appUser.id, username: appUser.username, user_type: 'app_user' },
      'test-secret-from-mock', // Ensure this matches the JWT_SECRET used by the handler
      { expiresIn: '7d' }
    );
    expect(setCookie).toHaveBeenCalledWith(mockEvent, 'app_user_jwt', 'signed-jwt-token', expect.any(Object));
  });

  // Add tests for user not found, incorrect password, database errors, etc.
});
