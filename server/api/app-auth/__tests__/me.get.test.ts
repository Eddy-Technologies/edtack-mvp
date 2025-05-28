// /server/api/app-auth/__tests__/me.get.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';
import meHandler from '../me.get';
import { privilegedSupabaseClientStub } from '../../../utils/__tests__/authConfig.test';

// Mock dependencies
vi.mock('../../../utils/authConfig', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getSupabaseClient: vi.fn(() => privilegedSupabaseClientStub),
    JWT_SECRET: 'test-secret-for-me', // Mock JWT_SECRET
  };
});

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCookie: vi.fn(),
    createError: vi.fn((err) => { throw err; }),
  };
});

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  }
}));

describe('GET /api/app-auth/me', () => {
  let mockEvent: H3Event;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = {
      context: {},
    } as unknown as H3Event;

    vi.mocked(getCookie).mockReturnValue(undefined);
    vi.mocked(require('jsonwebtoken').default.verify).mockImplementation(() => { throw new Error('jwt verify error'); });
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').select().eq().single).mockResolvedValue({ data: null, error: null });
  });

  it('should return 401 if no token is provided', async () => {
    await expect(meHandler(mockEvent))
      .rejects.toMatchObject({ statusCode: 401, statusMessage: 'Not authenticated' });
  });

  it('should return user data if token is valid and user_info exists', async () => {
    const mockToken = 'valid-jwt-token';
    const mockDecodedPayload = { app_user_id: 'user123', username: 'testuser', user_type: 'app_user' };
    const mockUserInfo = { id: 'info1', app_user_id: 'user123', username: 'testuser', email: null, user_id: null };

    vi.mocked(getCookie).mockReturnValueOnce(mockToken);
    vi.mocked(require('jsonwebtoken').default.verify).mockReturnValueOnce(mockDecodedPayload);
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').select().eq().single).mockResolvedValueOnce({ data: mockUserInfo, error: null });

    const response = await meHandler(mockEvent);

    expect(require('jsonwebtoken').default.verify).toHaveBeenCalledWith(mockToken, 'test-secret-for-me');
    expect(privilegedSupabaseClientStub.from('user_infos').select().eq).toHaveBeenCalledWith('app_user_id', mockDecodedPayload.app_user_id);
    expect(response).toEqual({
      app_user_id: mockDecodedPayload.app_user_id,
      username: mockDecodedPayload.username,
      user_type: 'app_user',
      userInfo: mockUserInfo,
    });
  });

  // Add tests for invalid token, token for different user_type, user_info not found, Supabase errors, etc.
});
