export const useFeatureFlags = () => {
  const config = useRuntimeConfig();
  const features = config.public.features;

  const isEnabled = (flag: keyof typeof features): boolean => {
    return features[flag] === true;
  };

  return {
    features,
    isEnabled,
    // Convenience getters for specific flags
    subscriptionPlans: computed(() => isEnabled('subscriptionPlans')),
    analytics: computed(() => isEnabled('analytics')),
  };
};
