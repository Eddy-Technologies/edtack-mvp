<template>
  <Teleport to="body">
    <div
      v-if="isActive && currentStep && targetRect"
      class="fixed inset-0 z-[10000]"
      @click.self="handleBackdropClick"
    >
      <!-- Spotlight overlay with box-shadow trick -->
      <div
        class="fixed rounded-lg transition-all duration-150 ease-out pointer-events-none"
        :style="spotlightStyle"
      />

      <!-- Tooltip -->
      <div
        ref="tooltipRef"
        class="fixed z-[10001] bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-[calc(100vw-2rem)] transition-all duration-150 ease-out"
        :style="tooltipStyle"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">{{ currentStep.title }}</h3>
            <button
              class="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              @click="skipTour"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-4 py-3">
          <p class="text-sm text-gray-600 leading-relaxed">{{ currentStep.description }}</p>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <!-- Progress dots -->
          <div class="flex items-center gap-1.5">
            <div
              v-for="(_, index) in totalSteps"
              :key="index"
              class="w-2 h-2 rounded-full transition-colors"
              :class="index === currentStepIndex ? 'bg-primary' : 'bg-gray-200'"
            />
          </div>

          <!-- Navigation buttons -->
          <div class="flex items-center gap-2">
            <button
              v-if="!isFirstStep"
              class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              @click="previousStep"
            >
              Back
            </button>
            <button
              class="px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              @click="handleNext"
            >
              {{ isLastStep ? 'Done' : 'Next' }}
            </button>
          </div>
        </div>

        <!-- Arrow pointer -->
        <div
          class="absolute w-3 h-3 bg-white border-gray-200 transform rotate-45"
          :class="arrowClasses"
          :style="arrowStyle"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useTour } from '~/composables/useTour';

// No props needed - we use events to communicate with parent components

const {
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  nextStep,
  previousStep,
  skipTour,
  closeTour,
} = useTour();

const tooltipRef = ref<HTMLElement | null>(null);
const targetRect = ref<DOMRect | null>(null);
const tooltipRect = ref<DOMRect | null>(null);

const PADDING = 8; // Padding around highlighted element
const TOOLTIP_GAP = 12; // Gap between element and tooltip
const VIEWPORT_PADDING = 16; // Padding from viewport edges

// Update target element position
const updateTargetRect = async () => {
  if (!currentStep.value) {
    targetRect.value = null;
    return;
  }

  // Run onBeforeShow callback if exists
  if (currentStep.value.onBeforeShow) {
    await currentStep.value.onBeforeShow();
    await nextTick();
  }

  const stepId = currentStep.value.id;

  // For mobile chat sidebar steps, trigger sidebar open via event
  if ((stepId === 'mobile-study' || stepId === 'mobile-profile') && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openChatSidebar'));
    // Wait for sidebar animation (300ms animation + buffer)
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  // For desktop-menu step, just open the sidebar to show the auth-widget
  if (stepId === 'desktop-menu' && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openChatSidebar'));
    // Wait for sidebar animation
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  // For desktop-study and desktop-profile steps, open the AuthenticationWidget dropdown
  if ((stepId === 'desktop-study' || stepId === 'desktop-profile') && typeof window !== 'undefined') {
    // Open the AuthenticationWidget dropdown menu
    window.dispatchEvent(new CustomEvent('openAuthWidgetMenu'));
    // Wait for dropdown animation (100ms animation + buffer)
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // For dashboard tour steps on mobile, open the drawer via event
  if ((stepId === 'study-tab' || stepId === 'credits-tab' || stepId === 'tasks-tab') && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openDashboardDrawer'));
    // Wait for drawer animation (300ms animation + buffer)
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  // Try to find a VISIBLE element with retries
  // On mobile, there may be duplicate elements (desktop sidebar hidden, mobile drawer visible)
  let validRect: DOMRect | null = null;
  let attempts = 0;
  const maxAttempts = 10;

  while (!validRect && attempts < maxAttempts) {
    // Find all matching elements and pick the first visible one
    const elements = document.querySelectorAll(currentStep.value.element);
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      // Validate element is visible (has dimensions and is within viewport)
      if (rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0) {
        validRect = rect;
        break;
      }
    }
    if (!validRect) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (validRect) {
    targetRect.value = validRect;
  } else {
    console.warn(`Tour: Element not found or not visible for step "${currentStep.value.id}"`);
    targetRect.value = null;
    // Close tour without marking as completed - user can restart from settings
    closeTour();
  }
};

// Update tooltip position after render
const updateTooltipRect = async () => {
  await nextTick();
  if (tooltipRef.value) {
    tooltipRect.value = tooltipRef.value.getBoundingClientRect();
  }
};

// Spotlight style using box-shadow
const spotlightStyle = computed(() => {
  if (!targetRect.value) return {};

  return {
    top: `${targetRect.value.top - PADDING}px`,
    left: `${targetRect.value.left - PADDING}px`,
    width: `${targetRect.value.width + PADDING * 2}px`,
    height: `${targetRect.value.height + PADDING * 2}px`,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
  };
});

// Calculate best tooltip position
const calculatedPosition = computed(() => {
  if (!targetRect.value) return 'bottom';

  const preferredPosition = currentStep.value?.position || 'bottom';
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const tooltipHeight = tooltipRect.value?.height || 200;
  const tooltipWidth = tooltipRect.value?.width || 320;

  // Check if preferred position fits
  const spaceAbove = targetRect.value.top;
  const spaceBelow = viewportHeight - targetRect.value.bottom;
  const spaceLeft = targetRect.value.left;
  const spaceRight = viewportWidth - targetRect.value.right;

  // Try preferred position first, then fallback
  if (preferredPosition === 'top' && spaceAbove >= tooltipHeight + TOOLTIP_GAP) return 'top';
  if (preferredPosition === 'bottom' && spaceBelow >= tooltipHeight + TOOLTIP_GAP) return 'bottom';
  if (preferredPosition === 'left' && spaceLeft >= tooltipWidth + TOOLTIP_GAP) return 'left';
  if (preferredPosition === 'right' && spaceRight >= tooltipWidth + TOOLTIP_GAP) return 'right';

  // Fallback: choose position with most space
  if (spaceBelow >= tooltipHeight + TOOLTIP_GAP) return 'bottom';
  if (spaceAbove >= tooltipHeight + TOOLTIP_GAP) return 'top';
  if (spaceRight >= tooltipWidth + TOOLTIP_GAP) return 'right';
  if (spaceLeft >= tooltipWidth + TOOLTIP_GAP) return 'left';

  return 'bottom'; // Default fallback
});

// Tooltip positioning style
const tooltipStyle = computed(() => {
  if (!targetRect.value) return { opacity: 0 };

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const tooltipWidth = tooltipRect.value?.width || 320;
  const tooltipHeight = tooltipRect.value?.height || 200;

  let top = 0;
  let left = 0;

  switch (calculatedPosition.value) {
    case 'top':
      top = targetRect.value.top - PADDING - TOOLTIP_GAP - tooltipHeight;
      left = targetRect.value.left + targetRect.value.width / 2 - tooltipWidth / 2;
      break;
    case 'bottom':
      top = targetRect.value.bottom + PADDING + TOOLTIP_GAP;
      left = targetRect.value.left + targetRect.value.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = targetRect.value.top + targetRect.value.height / 2 - tooltipHeight / 2;
      left = targetRect.value.left - PADDING - TOOLTIP_GAP - tooltipWidth;
      break;
    case 'right':
      top = targetRect.value.top + targetRect.value.height / 2 - tooltipHeight / 2;
      left = targetRect.value.right + PADDING + TOOLTIP_GAP;
      break;
  }

  // Clamp to viewport
  left = Math.max(VIEWPORT_PADDING, Math.min(left, viewportWidth - tooltipWidth - VIEWPORT_PADDING));
  top = Math.max(VIEWPORT_PADDING, Math.min(top, viewportHeight - tooltipHeight - VIEWPORT_PADDING));

  return {
    top: `${top}px`,
    left: `${left}px`,
  };
});

// Arrow positioning classes
const arrowClasses = computed(() => {
  switch (calculatedPosition.value) {
    case 'top':
      return 'border-b border-r -bottom-1.5 left-1/2 -translate-x-1/2';
    case 'bottom':
      return 'border-t border-l -top-1.5 left-1/2 -translate-x-1/2';
    case 'left':
      return 'border-t border-r -right-1.5 top-1/2 -translate-y-1/2';
    case 'right':
      return 'border-b border-l -left-1.5 top-1/2 -translate-y-1/2';
    default:
      return '';
  }
});

// Arrow style adjustments for edge cases
const arrowStyle = computed(() => {
  // Could add dynamic left/top positioning if tooltip is clamped
  return {};
});

// Handle next button click
const handleNext = () => {
  nextStep();
};

// Handle backdrop click (skip tour)
const handleBackdropClick = () => {
  // Could be used to skip or do nothing
};

// Handle keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!isActive.value) return;

  if (e.key === 'Escape') {
    skipTour();
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    handleNext();
  } else if (e.key === 'ArrowLeft') {
    previousStep();
  }
};

// Handle window resize
const handleResize = () => {
  updateTargetRect();
};

// Watch for step changes
watch(
  () => currentStep.value,
  async () => {
    await updateTargetRect();
    await updateTooltipRect();
  },
  { immediate: true }
);

// Watch for active state changes
watch(
  () => isActive.value,
  async (active) => {
    if (active) {
      await updateTargetRect();
      await updateTooltipRect();
    } else {
      // Tour ended - close any open menus
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('closeAuthWidgetMenu'));
      }
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
});
</script>
