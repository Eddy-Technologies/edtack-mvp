import { ref, computed, readonly } from 'vue';
import type { TourStep, TourConfig } from '~/constants/tourSteps';
import {
  CHAT_TOUR_MOBILE,
  CHAT_TOUR_DESKTOP,
  DASHBOARD_TOUR,
} from '~/constants/tourSteps';

const TOUR_STORAGE_KEY = 'edtack_tour_state';

interface TourState {
  [tourId: string]: {
    completed: boolean;
    completedAt?: number;
  };
}

// Global reactive state (shared across components)
const isActive = ref(false);
const currentTourId = ref<string | null>(null);
const currentStepIndex = ref(0);
const currentSteps = ref<TourStep[]>([]);

/**
 * Composable for managing onboarding tours
 * SSR-safe with localStorage persistence
 */
export const useTour = () => {
  // Get tour state from localStorage (SSR-safe)
  const getTourState = (): TourState => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  // Save tour state to localStorage
  const saveTourState = (state: TourState) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  };

  // Check if a tour has been completed
  const isTourCompleted = (tourId: string): boolean => {
    const state = getTourState();
    return state[tourId]?.completed === true;
  };

  // Mark a tour as completed
  const markTourCompleted = (tourId: string) => {
    const state = getTourState();
    state[tourId] = {
      completed: true,
      completedAt: Date.now(),
    };
    saveTourState(state);
  };

  // Reset a specific tour (for testing or "restart tour" feature)
  const resetTour = (tourId: string) => {
    const state = getTourState();
    const { [tourId]: _, ...rest } = state;
    saveTourState(rest);
  };

  // Get the appropriate tour config based on device
  const getTourConfig = (tourId: string, isMobile: boolean): TourConfig | null => {
    if (tourId === 'chat-tour') {
      return isMobile ? CHAT_TOUR_MOBILE : CHAT_TOUR_DESKTOP;
    }
    if (tourId === 'dashboard-tour') {
      return DASHBOARD_TOUR;
    }
    return null;
  };

  // Start a tour
  const startTour = (tourId: string, isMobile: boolean = false) => {
    const config = getTourConfig(tourId, isMobile);
    if (!config) return;

    currentTourId.value = tourId;
    currentSteps.value = config.steps;
    currentStepIndex.value = 0;
    isActive.value = true;
  };

  // Go to next step
  const nextStep = () => {
    if (currentStepIndex.value < currentSteps.value.length - 1) {
      currentStepIndex.value++;
    } else {
      // Tour complete
      completeTour();
    }
  };

  // Go to previous step
  const previousStep = () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
    }
  };

  // Skip/dismiss the tour
  const skipTour = () => {
    if (currentTourId.value) {
      markTourCompleted(currentTourId.value);
    }
    closeTour();
  };

  // Complete the tour successfully
  const completeTour = () => {
    if (currentTourId.value) {
      markTourCompleted(currentTourId.value);
    }
    closeTour();
  };

  // Close the tour without marking complete
  const closeTour = () => {
    isActive.value = false;
    currentTourId.value = null;
    currentStepIndex.value = 0;
    currentSteps.value = [];
  };

  // Current step data
  const currentStep = computed((): TourStep | null => {
    if (!isActive.value || currentSteps.value.length === 0) return null;
    return currentSteps.value[currentStepIndex.value] || null;
  });

  // Progress info
  const totalSteps = computed(() => currentSteps.value.length);
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === currentSteps.value.length - 1);

  return {
    // State
    isActive: readonly(isActive),
    currentStep,
    currentStepIndex: readonly(currentStepIndex),
    totalSteps,
    isFirstStep,
    isLastStep,
    currentTourId: readonly(currentTourId),

    // Actions
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    closeTour,

    // Persistence
    isTourCompleted,
    resetTour,
  };
};
