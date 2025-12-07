import { checkTokenLimit } from '~~/server/services/tokenUsageService';

/**
 * Middleware to check token limits before AI-related endpoints
 * Implements soft limit enforcement (logs warnings, adds headers, but allows requests)
 */

const AI_ENDPOINTS = [
  '/api/quiz/generate',
  '/api/quiz/attempt',
  // Add other AI-related endpoints here as needed
];

function isAIEndpoint(path: string): boolean {
  return AI_ENDPOINTS.some((endpoint) => path.startsWith(endpoint));
}

export default defineEventHandler(async (event) => {
  try {
    const path = event.node.req.url || '';

    // Only apply to AI endpoints
    if (!isAIEndpoint(path)) {
      return;
    }

    // Get authenticated user
    let user;
    try {
      const supabase = await getSupabaseClient(event);
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        // Not authenticated - skip limit check
        return;
      }

      // Get user_info_id from user_infos table
      const { data: userInfo } = await supabase
        .from('user_infos')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (!userInfo) {
        return;
      }

      user = userInfo;
    } catch (err) {
      console.error('[TokenLimitMiddleware] Auth check error:', err);
      // Auth check failed - skip limit check
      return;
    }

    // Check token limit
    const limitCheck = await checkTokenLimit(await getSupabaseClient(event), user.id);

    // Soft limit: Log warning and add header, but allow request
    if (limitCheck.isExceeded) {
      console.warn(`[TokenLimitMiddleware] User ${user.id} exceeded token limit: ${limitCheck.message}`);
      setHeader(event, 'X-Token-Limit-Exceeded', 'true');
      setHeader(event, 'X-Token-Usage-Percentage', limitCheck.usagePercentage.toString());
    } else if (limitCheck.isWarning) {
      console.log(`[TokenLimitMiddleware] User ${user.id} approaching token limit: ${limitCheck.message}`);
      setHeader(event, 'X-Token-Limit-Warning', 'true');
      setHeader(event, 'X-Token-Usage-Percentage', limitCheck.usagePercentage.toString());
    }

    // For future hard limit enforcement:
    // if (limitCheck.isExceeded && !limitCheck.allowed) {
    //   throw createError({
    //     statusCode: 429,
    //     statusMessage: 'Token limit exceeded. Please upgrade your plan.'
    //   });
    // }
  } catch (error) {
    // Middleware errors should not block requests
    console.error('[TokenLimitMiddleware] Error:', error);
  }
});
