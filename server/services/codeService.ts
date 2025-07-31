import type { SupabaseClient } from '@supabase/supabase-js';

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
  codeService.getCodesMap(supabase, 'operation_type');

export const getOrderStatuses = (supabase: SupabaseClient) =>
  codeService.getCodesMap(supabase, 'order_status');
