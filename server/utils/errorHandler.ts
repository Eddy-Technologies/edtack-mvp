// Centralized error handling utilities for consistent API responses

import type { AuthError } from '@supabase/supabase-js';
import { ErrorType, ERROR_MAPPINGS, SUPABASE_ERROR_PATTERNS, type StandardError } from './errorTypes';

/**
 * Creates a standardized error response using H3's createError
 * @param errorType - The type of error from ErrorType enum
 * @param customMessage - Optional custom message to override default
 * @param details - Optional additional error details
 * @returns H3 error object
 */
export function createStandardError(
  errorType: ErrorType,
  customMessage?: string,
  details?: any
) {
  const mapping = ERROR_MAPPINGS[errorType];
  const message = customMessage || mapping.message;

  return createError({
    statusCode: mapping.statusCode,
    statusMessage: message,
    data: {
      error: {
        type: errorType,
        message,
        ...(details && { details })
      } as StandardError
    }
  });
}

/**
 * Handles Supabase authentication errors and maps them to standard error types
 * @param supabaseError - The error object from Supabase
 * @param customMessage - Optional custom message
 * @returns H3 error object
 */
export function supabaseAuthError(supabaseError: AuthError, customMessage?: string) {
  const errorMessage = supabaseError?.message || '';

  // Try to match the error message to known patterns
  for (const { pattern, errorType } of SUPABASE_ERROR_PATTERNS) {
    const isMatch = pattern instanceof RegExp ?
        pattern.test(errorMessage) :
        errorMessage.toLowerCase().includes(pattern.toLowerCase());

    if (isMatch) {
      return createStandardError(errorType, customMessage);
    }
  }

  // Default fallback for unmatched Supabase errors
  return createStandardError(
    ErrorType.INTERNAL_SERVER_ERROR,
    customMessage || errorMessage || 'Authentication failed'
  );
}
