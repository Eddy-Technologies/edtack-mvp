import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ORDER_STATUS,
  OPERATION_TYPE,
  TASK_STATUS,
  MARKING_STATUS,
  QUESTION_TYPE,
  GROUP_MEMBER_STATUS,
  GROUP_TYPE,
  USER_ROLE,
  MESSAGE_STATUS,
  ENTITY_STATUS,
  TRANSFER_TYPE,
  FEEDBACK_TYPE,
  STRIPE_MODE,
  STUDY_TYPE,
  GENERATION_INTENT_TYPE
} from '~~/shared/constants';
import { CODE_CATEGORIES } from '~~/app/stores/codes';

export interface Code {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class CodeService {
  private codeCache: Map<string, Map<string, Code>> = new Map();
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Core cache management
  async loadCodes(supabase: SupabaseClient): Promise<void> {
    try {
      const { data: codes, error } = await supabase
        .from('codes')
        .select('*')
        .eq('is_active', true)
        .order('category, sort_order');

      if (error) {
        throw new Error(`Failed to load codes: ${error.message}`);
      }

      this.codeCache.clear();
      codes?.forEach((code) => {
        if (!this.codeCache.has(code.category)) {
          this.codeCache.set(code.category, new Map());
        }
        this.codeCache.get(code.category)!.set(code.code, code);
      });

      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      console.log(`[CodeService] Loaded ${codes?.length} codes across ${this.codeCache.size} categories`);
    } catch (error) {
      console.error('[CodeService] Failed to load codes:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.codeCache.clear();
    this.cacheExpiry = 0;
  }

  private isCacheExpired(): boolean {
    return Date.now() > this.cacheExpiry || this.codeCache.size === 0;
  }

  // Generic code retrieval
  async getCodesByCategory(supabase: SupabaseClient, category: string): Promise<Code[]> {
    if (this.isCacheExpired()) {
      await this.loadCodes(supabase);
    }

    const categoryMap = this.codeCache.get(category);
    if (!categoryMap) {
      return [];
    }

    return Array.from(categoryMap.values()).sort((a, b) => a.sort_order - b.sort_order);
  }

  async getCode(supabase: SupabaseClient, category: string, code: string): Promise<Code | null> {
    if (this.isCacheExpired()) {
      await this.loadCodes(supabase);
    }

    const categoryMap = this.codeCache.get(category);
    return categoryMap?.get(code) || null;
  }

  async getCodesMap(supabase: SupabaseClient, category: string): Promise<Record<string, string>> {
    const codes = await this.getCodesByCategory(supabase, category);
    return codes.reduce((acc, code) => {
      acc[code.code] = code.code;
      return acc;
    }, {} as Record<string, string>);
  }

  async validateCode(supabase: SupabaseClient, category: string, code: string): Promise<boolean> {
    const codeObj = await this.getCode(supabase, category, code);
    return codeObj !== null;
  }
}

// Export singleton instance
export const codeService = new CodeService();

// Generic convenience function
export const getCodes = (supabase: SupabaseClient, category: string) =>
  codeService.getCodesMap(supabase, category);

export const getOperationTypes = (supabase: SupabaseClient) =>
  codeService.getCodesMap(supabase, CODE_CATEGORIES.OPERATION_TYPE);

export const getOrderStatuses = (supabase: SupabaseClient) =>
  codeService.getCodesMap(supabase, CODE_CATEGORIES.ORDER_STATUS);

export const getTaskStatuses = (supabase: SupabaseClient) =>
  codeService.getCodesMap(supabase, CODE_CATEGORIES.TASK_STATUS);

export const getRecurrenceFrequencies = (supabase: SupabaseClient) =>
  codeService.getCodesMap(supabase, CODE_CATEGORIES.RECURRENCE_FREQUENCY);

export const getOrderFulfillmentStatuses = (supabase: SupabaseClient) =>
  codeService.getCodesMap(supabase, CODE_CATEGORIES.ORDER_FULFILLMENT);

// Type-safe validation functions
export const isValidOrderStatus = (status: string): status is ORDER_STATUS =>
  Object.values(ORDER_STATUS).includes(status as ORDER_STATUS);

export const isValidOperationType = (type: string): type is OPERATION_TYPE =>
  Object.values(OPERATION_TYPE).includes(type as OPERATION_TYPE);

export const isValidTaskStatus = (status: string): status is TASK_STATUS =>
  Object.values(TASK_STATUS).includes(status as TASK_STATUS);

export const isValidMarkingStatus = (status: string): status is MARKING_STATUS =>
  Object.values(MARKING_STATUS).includes(status as MARKING_STATUS);

export const isValidQuestionType = (type: string): type is QUESTION_TYPE =>
  Object.values(QUESTION_TYPE).includes(type as QUESTION_TYPE);

export const isValidGroupMemberStatus = (status: string): status is GROUP_MEMBER_STATUS =>
  Object.values(GROUP_MEMBER_STATUS).includes(status as GROUP_MEMBER_STATUS);

export const isValidGroupType = (type: string): type is GROUP_TYPE =>
  Object.values(GROUP_TYPE).includes(type as GROUP_TYPE);

export const isValidUserRole = (role: string): role is USER_ROLE =>
  Object.values(USER_ROLE).includes(role as USER_ROLE);

export const isValidMessageStatus = (status: string): status is MESSAGE_STATUS =>
  Object.values(MESSAGE_STATUS).includes(status as MESSAGE_STATUS);

export const isValidEntityStatus = (status: string): status is ENTITY_STATUS =>
  Object.values(ENTITY_STATUS).includes(status as ENTITY_STATUS);

export const isValidTransferType = (type: string): type is TRANSFER_TYPE =>
  Object.values(TRANSFER_TYPE).includes(type as TRANSFER_TYPE);

export const isValidFeedbackType = (type: string): type is FEEDBACK_TYPE =>
  Object.values(FEEDBACK_TYPE).includes(type as FEEDBACK_TYPE);

export const isValidStripeMode = (mode: string): mode is STRIPE_MODE =>
  Object.values(STRIPE_MODE).includes(mode as STRIPE_MODE);

export const isValidStudyType = (type: string): type is STUDY_TYPE =>
  Object.values(STUDY_TYPE).includes(type as STUDY_TYPE);

export const isValidGenerationIntentType = (type: string): type is GENERATION_INTENT_TYPE =>
  Object.values(GENERATION_INTENT_TYPE).includes(type as GENERATION_INTENT_TYPE);
