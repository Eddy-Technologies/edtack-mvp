/**
 * Composable for responsive breakpoint detection
 * SSR-safe with debounced resize listener
 */
export const useResponsive = () => {
  // Breakpoints aligned with Tailwind CSS defaults
  const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  } as const;

  const width = ref(0);
  const height = ref(0);

  // Computed breakpoint states
  const isMobile = computed(() => width.value > 0 && width.value < BREAKPOINTS.md);
  const isTablet = computed(
    () => width.value >= BREAKPOINTS.md && width.value < BREAKPOINTS.lg
  );
  const isDesktop = computed(() => width.value >= BREAKPOINTS.lg);

  // Specific breakpoint checks
  const isSm = computed(() => width.value >= BREAKPOINTS.sm);
  const isMd = computed(() => width.value >= BREAKPOINTS.md);
  const isLg = computed(() => width.value >= BREAKPOINTS.lg);
  const isXl = computed(() => width.value >= BREAKPOINTS.xl);
  const is2xl = computed(() => width.value >= BREAKPOINTS['2xl']);

  // Debounce helper
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  const debounce = (fn: () => void, delay: number) => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(fn, delay);
  };

  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
    }
  };

  const handleResize = () => {
    debounce(updateDimensions, 100);
  };

  // SSR-safe initialization
  onMounted(() => {
    updateDimensions();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });

  return {
    // Dimensions
    width: readonly(width),
    height: readonly(height),

    // Device type
    isMobile,
    isTablet,
    isDesktop,

    // Tailwind breakpoints
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,

    // Constants
    BREAKPOINTS,
  };
};
