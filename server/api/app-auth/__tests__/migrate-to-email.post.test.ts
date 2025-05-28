// /server/api/app-auth/__tests__/migrate-to-email.post.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';
import migrateHandler from '../migrate-to-email.post';
import { privilegedSupabaseClientStub } from '../../../utils/__tests__/authConfig.test';

// Mock dependencies
vi.mock('../../../utils/authConfig', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getPrivilegedSupabaseClient: vi.fn(() => privilegedSupabaseClientStub),
    getSupabaseClient: vi.fn(() => privilegedSupabaseClientStub), // Assuming RLS client might be used or for consistency
    JWT_SECRET: 'test-migrate-secret',
  };
});

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readBody: vi.fn(),
    getHeader: vi.fn(),
    createError: vi.fn((err) => { throw err; }),
  };
});

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  }
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(), // For the local authenticateAppUserJWT
  }
}));

describe('POST /api/app-auth/migrate-to-email', () => {
  let mockEvent: H3Event;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = {
      context: {}, // Will be populated by mocked authenticateAppUserJWT
    } as unknown as H3Event;

    // Default mock implementations
    vi.mocked(getHeader).mockReturnValue(undefined); // No auth header by default
    vi.mocked(require('jsonwebtoken').default.verify).mockImplementation(() => { throw new Error('jwt verify error'); });
    vi.mocked(readBody).mockResolvedValue({});
    vi.mocked(privilegedSupabaseClientStub.from('app_users').select().eq().maybeSingle).mockResolvedValue({ data: null, error: null });
    vi.mocked(require('bcryptjs').default.compare).mockResolvedValue(false);
    vi.mocked(privilegedSupabaseClientStub.auth.admin.createUser).mockResolvedValue({ data: { user: null }, error: { message: 'creation failed' } });
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').update().eq().select().single).mockResolvedValue({ data: null, error: { message: 'update failed' } });
    vi.mocked(privilegedSupabaseClientStub.from('app_users').delete().eq).mockResolvedValue({ data: null, error: null });
    vi.mocked(privilegedSupabaseClientStub.auth.admin.deleteUser).mockResolvedValue({ data: { user: null }, error: null });
  });

  it('should return 401 if authentication fails (no token)', async () => {
    vi.mocked(getHeader).mockReturnValueOnce(undefined); // No Authorization header
    await expect(migrateHandler(mockEvent))
      .rejects.toMatchObject({ statusCode: 401, statusMessage: 'Authorization header is missing.' });
  });

  it('should return 401 if JWT verification fails', async () => {
    vi.mocked(getHeader).mockReturnValueOnce('Bearer invalidtoken');
    vi.mocked(require('jsonwebtoken').default.verify).mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });
    await expect(migrateHandler(mockEvent))
      .rejects.toMatchObject({ statusCode: 403, statusMessage: 'Invalid or expired token.' });
  });

  it('should successfully migrate user', async () => {
    const appUserId = 'app-user-id-123';
    const username = 'testmigrator';
    const newEmail = 'new@example.com';
    const currentPassword = 'oldPassword123';
    const newSupabasePassword = 'newPassword456';
    const supabaseAuthUserId = 'supabase-user-id-789';

    vi.mocked(getHeader).mockReturnValueOnce(`Bearer validtoken`);
    vi.mocked(require('jsonwebtoken').default.verify).mockReturnValueOnce({ app_user_id: appUserId, username, user_type: 'app_user' });
    vi.mocked(readBody).mockResolvedValueOnce({ newEmail, currentPassword, newSupabasePassword });
    vi.mocked(privilegedSupabaseClientStub.from('app_users').select().eq().maybeSingle)
      .mockResolvedValueOnce({ data: { id: appUserId, username, encrypted_password: 'hashedOldPassword' }, error: null });
    vi.mocked(require('bcryptjs').default.compare).mockResolvedValueOnce(true); // Password matches
    vi.mocked(privilegedSupabaseClientStub.auth.admin.createUser)
      .mockResolvedValueOnce({ data: { user: { id: supabaseAuthUserId, email: newEmail } }, error: null });
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').update().eq().select().single)
      .mockResolvedValueOnce({ data: { id: 'user-info-id', user_id: supabaseAuthUserId, app_user_id: null }, error: null });

    const response = await migrateHandler(mockEvent);

    expect(mockEvent.context.user).toEqual({ app_user_id: appUserId, username, user_type: 'app_user' });
    expect(privilegedSupabaseClientStub.auth.admin.createUser).toHaveBeenCalledWith({
      email: newEmail,
      password: newSupabasePassword,
      email_confirm: true,
      user_metadata: { username_from_app_user: username, original_app_user_id: appUserId },
    });
    expect(privilegedSupabaseClientStub.from('user_infos').update).toHaveBeenCalledWith({ user_id: supabaseAuthUserId, app_user_id: null });
    expect(privilegedSupabaseClientStub.from('app_users').delete().eq).toHaveBeenCalledWith('id', appUserId);
    expect(response).toEqual({
      success: true,
      message: 'User migrated to Supabase Auth successfully.',
      supabaseUserId: supabaseAuthUserId,
    });
  });

  // Add tests for missing body params, app_user not found, incorrect password, Supabase errors, user_infos update error (and rollback), etc.
});
