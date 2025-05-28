// /server/api/app-auth/__tests__/delete-user.post.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';
import deleteUserHandler from '../delete-user.post';
import { privilegedSupabaseClientStub } from '../../../utils/__tests__/authConfig.test'; // Import the stub

// Mock dependencies
vi.mock('../../../utils/authConfig', () => ({
  getPrivilegedSupabaseClient: vi.fn(() => privilegedSupabaseClientStub),
}));

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readBody: vi.fn(),
    createError: vi.fn((err) => { throw err; }), // Simulate createError throwing
  };
});

describe('POST /api/app-auth/delete-user', () => {
  let mockEvent: H3Event;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = {
      context: {},
      // Add other event properties if your handler uses them
    } as unknown as H3Event;

    // Reset stub states or mock implementations if necessary
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').select().eq().single).mockResolvedValue({ data: null, error: null });
    vi.mocked(privilegedSupabaseClientStub.auth.admin.deleteUser).mockResolvedValue({ data: { user: null }, error: null });
    vi.mocked(privilegedSupabaseClientStub.from('app_users').delete().eq).mockResolvedValue({ data: null, error: null });
  });

  it('should return 400 if user_info_id is not provided', async () => {
    vi.mocked(readBody).mockResolvedValueOnce({});
    await expect(deleteUserHandler(mockEvent))
      .rejects.toMatchObject({ statusCode: 400, statusMessage: 'User Info ID is required for deletion.' });
  });

  it('should successfully delete a Supabase auth user and their user_info', async () => {
    const userInfoId = 'test-user-info-id';
    const supabaseAuthUserId = 'test-supabase-auth-user-id';
    vi.mocked(readBody).mockResolvedValueOnce({ user_info_id: userInfoId });
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').select().eq().single).mockResolvedValueOnce({
      data: { id: userInfoId, user_id: supabaseAuthUserId, app_user_id: null },
      error: null,
    });

    const response = await deleteUserHandler(mockEvent);

    expect(privilegedSupabaseClientStub.auth.admin.deleteUser).toHaveBeenCalledWith(supabaseAuthUserId);
    expect(response).toEqual({ success: true, message: 'User and associated data deleted successfully.' });
  });

  it('should successfully delete an app_user and their user_info', async () => {
    const userInfoId = 'test-user-info-id-app';
    const appUserId = 'test-app-user-id';
    vi.mocked(readBody).mockResolvedValueOnce({ user_info_id: userInfoId });
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').select().eq().single).mockResolvedValueOnce({
      data: { id: userInfoId, user_id: null, app_user_id: appUserId },
      error: null,
    });

    const response = await deleteUserHandler(mockEvent);
    expect(privilegedSupabaseClientStub.from('app_users').delete().eq).toHaveBeenCalledWith('id', appUserId);
    expect(response).toEqual({ success: true, message: 'User and associated data deleted successfully.' });
  });

  // Add more tests for error cases, user_info not found, etc.
});
