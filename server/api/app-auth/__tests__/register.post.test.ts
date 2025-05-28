// /server/api/app-auth/__tests__/register.post.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';
import registerHandler from '../register.post';
import { privilegedSupabaseClientStub } from '../../../utils/__tests__/authConfig.test';

// Mock dependencies
vi.mock('../../../utils/authConfig', () => ({
  getPrivilegedSupabaseClient: vi.fn(() => privilegedSupabaseClientStub),
}));

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readBody: vi.fn(),
    createError: vi.fn((err) => { throw err; }),
  };
});

describe('POST /api/app-auth/register', () => {
  let mockEvent: H3Event;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = {
      context: {},
    } as unknown as H3Event;

    // Default mock implementations
    vi.mocked(readBody).mockResolvedValue({});
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').select().or().limit().single)
      .mockResolvedValue({ data: null, error: null }); // No existing user by default
    vi.mocked(privilegedSupabaseClientStub.auth.admin.createUser)
      .mockResolvedValue({ data: { user: null }, error: { message: 'creation failed' } });
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').insert().select().single)
      .mockResolvedValue({ data: null, error: { message: 'insert failed' } });
    vi.mocked(privilegedSupabaseClientStub.auth.admin.deleteUser)
      .mockResolvedValue({ data: { user: null }, error: null }); // For rollback
  });

  it('should return 400 if email, password, or username is not provided', async () => {
    vi.mocked(readBody).mockResolvedValueOnce({ email: 'test@example.com', password: 'password' }); // Missing username
    await expect(registerHandler(mockEvent))
      .rejects.toMatchObject({ statusCode: 400, statusMessage: 'Email, password, and username are required.' });
  });

  it('should successfully register a new user', async () => {
    const email = 'newuser@example.com';
    const password = 'password123';
    const username = 'newusername';
    const supabaseAuthUserId = 'supabase-user-id-123';
    const userInfoId = 'user-info-id-456';

    vi.mocked(readBody).mockResolvedValueOnce({ email, password, username });
    // No existing user
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').select().or().limit().single).mockResolvedValueOnce({ data: null, error: null });
    // Supabase user creation success
    vi.mocked(privilegedSupabaseClientStub.auth.admin.createUser)
      .mockResolvedValueOnce({ data: { user: { id: supabaseAuthUserId, email } }, error: null });
    // user_infos creation success
    vi.mocked(privilegedSupabaseClientStub.from('user_infos').insert().select().single)
      .mockResolvedValueOnce({ data: { id: userInfoId, user_id: supabaseAuthUserId, username, email }, error: null });

    const response = await registerHandler(mockEvent);

    expect(privilegedSupabaseClientStub.auth.admin.createUser).toHaveBeenCalledWith({
      email,
      password,
      email_confirm: true, // Or false, depending on your flow
      user_metadata: { username },
    });
    expect(privilegedSupabaseClientStub.from('user_infos').insert).toHaveBeenCalledWith([
      { user_id: supabaseAuthUserId, username, email },
    ]);
    expect(response).toEqual({
      success: true,
      message: 'User registered successfully. Please check your email to confirm.',
      userId: supabaseAuthUserId,
      userInfoId: userInfoId,
    });
  });

  // Add tests for:
  // - Email or username already exists
  // - Supabase auth user creation failure
  // - user_infos creation failure (and rollback of Supabase auth user)
  // - Password too short (if you add that validation)
});
