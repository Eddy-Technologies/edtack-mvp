import { defineStore } from 'pinia';

interface Code {
  code: string;
  name: string;
  description: string;
  category: string;
  sort_order: number;
}

interface CodeOption {
  value: string;
  label: string;
  description?: string;
}

interface CodesState {
  codes: Record<string, Code[]>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

// Code categories enum for type safety
export const CODE_CATEGORIES = {
  TASK_STATUS: 'TASK_STATUS',
  TASK_CATEGORY: 'TASK_CATEGORY',
  RECURRENCE_FREQUENCY: 'RECURRENCE_FREQUENCY',
  ORDER_STATUS: 'ORDER_STATUS',
  ORDER_FULFILLMENT: 'ORDER_FULFILLMENT',
  OPERATION_TYPE: 'OPERATION_TYPE',
  SUBJECT: 'SUBJECT',
  LESSON_GENERATION_TYPE: 'LESSON_GENERATION_TYPE'
} as const;

export type CodeCategory = typeof CODE_CATEGORIES[keyof typeof CODE_CATEGORIES];

export const useCodesStore = defineStore('codes', {
  state: (): CodesState => ({
    codes: {},
    isLoaded: false,
    isLoading: false,
    error: null
  }),

  getters: {
    // Generic getter for any category
    getCodesByCategory: (state) => {
      return (category: CodeCategory): CodeOption[] => {
        const categoryCodes = state.codes[category] || [];
        return categoryCodes.map((code) => ({
          value: code.code,
          label: code.name,
          description: code.description
        }));
      };
    },

    // Specific category getters using the generic function
    taskStatuses(): CodeOption[] {
      return this.getCodesByCategory(CODE_CATEGORIES.TASK_STATUS);
    },

    taskCategories(): CodeOption[] {
      return this.getCodesByCategory(CODE_CATEGORIES.TASK_CATEGORY);
    },

    recurrenceFrequencies(): CodeOption[] {
      return this.getCodesByCategory(CODE_CATEGORIES.RECURRENCE_FREQUENCY);
    },

    orderStatuses(): CodeOption[] {
      return this.getCodesByCategory(CODE_CATEGORIES.ORDER_STATUS);
    },

    orderFulfillmentStatuses(): CodeOption[] {
      return this.getCodesByCategory(CODE_CATEGORIES.ORDER_FULFILLMENT);
    },

    operationTypes(): CodeOption[] {
      return this.getCodesByCategory(CODE_CATEGORIES.OPERATION_TYPE);
    },

    subjects(): CodeOption[] {
      return this.getCodesByCategory(CODE_CATEGORIES.SUBJECT);
    },

    lessonGenerationTypes(): CodeOption[] {
      return this.getCodesByCategory(CODE_CATEGORIES.LESSON_GENERATION_TYPE);
    },

    // Get a specific code's label
    getCodeLabel: (state) => {
      return (category: CodeCategory, code: string): string => {
        const categoryCodes = state.codes[category];
        if (!categoryCodes) return code;

        const found = categoryCodes.find((c) => c.code === code);
        return found ? found.name : code;
      };
    },

    // Check if a code exists
    hasCode: (state) => {
      return (category: CodeCategory, code: string): boolean => {
        const categoryCodes = state.codes[category];
        if (!categoryCodes) return false;

        return categoryCodes.some((c) => c.code === code);
      };
    },

    // Get all categories
    getAllCategories: (state) => (): string[] => {
      return Object.keys(state.codes);
    }
  },

  actions: {
    async loadCodes() {
      if (this.isLoaded || this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const response = await $fetch('/api/codes/codes');

        if (!response.success || !response.codes) {
          throw new Error('Invalid response from codes API');
        }

        // Group and sort codes by category
        this.codes = this.groupAndSortCodes(response.codes);
        this.isLoaded = true;
      } catch (error: any) {
        console.error('Failed to load codes:', error);
        this.error = error.message || 'Failed to load system codes';
        throw error; // Re-throw to handle in plugin
      } finally {
        this.isLoading = false;
      }
    },

    // Helper to group and sort codes
    groupAndSortCodes(codes: Code[]): Record<string, Code[]> {
      const grouped = codes.reduce((acc: Record<string, Code[]>, code: Code) => {
        if (!acc[code.category]) {
          acc[code.category] = [];
        }
        acc[code.category].push(code);
        return acc;
      }, {});

      // Sort codes within each category by sort_order
      Object.values(grouped).forEach((categoryCode) => {
        categoryCode.sort((a, b) => a.sort_order - b.sort_order);
      });

      return grouped;
    },

    // Force reload codes
    async reloadCodes() {
      this.isLoaded = false;
      this.codes = {};
      await this.loadCodes();
    },

    // Clear all codes
    clearCodes() {
      this.codes = {};
      this.isLoaded = false;
      this.error = null;
    },

    // Update a single category
    updateCategory(category: CodeCategory, codes: Code[]) {
      this.codes[category] = codes.sort((a, b) => a.sort_order - b.sort_order);
    }
  }
});
