import { ref, readonly } from 'vue';

export const useDashboardData = () => {
  const isLoading = ref(false);
  const dashboardData = ref(null);
  const shopChildrenData = ref(null);
  const error = ref(null);

  const fetchDashboardData = async (userType: 'student' | 'parent') => {
    // Placeholder function - will be implemented later
    console.log('fetchDashboardData called with userType:', userType);
  };

  const refreshData = async (userType: 'student' | 'parent') => {
    // Placeholder function - will be implemented later
    console.log('refreshData called with userType:', userType);
  };

  return {
    isLoading: readonly(isLoading),
    dashboardData: readonly(dashboardData),
    shopChildrenData: readonly(shopChildrenData),
    error: readonly(error),
    fetchDashboardData,
    refreshData
  };
};
