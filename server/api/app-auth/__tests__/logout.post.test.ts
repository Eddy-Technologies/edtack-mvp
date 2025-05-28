// /server/api/app-auth/__tests__/logout.post.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';
import logoutHandler from '../logout.post';

// Mock dependencies
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    deleteCookie: vi.fn(),
  };
});

describe('POST /api/app-auth/logout', () => {
  let mockEvent: H3Event;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = {
      context: {},
    } as unknown as H3Event;
  });

  it('should delete the app_user_jwt cookie and return success', async () => {
    const response = await logoutHandler(mockEvent);

    expect(deleteCookie).toHaveBeenCalledWith(mockEvent, 'app_user_jwt', { path: '/', httpOnly: true, sameSite: 'lax' });
    expect(response).toEqual({ success: true, message: 'Logged out successfully.' });
  });
});
