import { ref, readonly } from 'vue';
import type { ParentDashboardRes } from '../models/User';

export const useDashboardData = () => {
  const isLoading = ref(false);
  const dashboardData = ref<ParentDashboardRes | null>(null);
  const shopChildrenData = ref(null);
  const error = ref(null);
  const fetchDashboardData = async (userRole: 'student' | 'parent') => {
    isLoading.value = true;
    error.value = null;

    try {
      dashboardData.value = await fetchDashboard(userRole);
    } catch (err) {
      error.value = err;
      console.error('Error fetching dashboard data:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDashboard = async (input): Promise<ParentDashboardRes | null> => {
    if (input !== 'student' && input !== 'parent') {
      throw new Error('Invalid userRole. Must be "student" or "parent".');
    }
    let data: ParentDashboardRes | null = null;
    try {
      if (input === 'student') {
        data = await $fetch('/api/dashboard/student', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }

      if (input === 'parent') {
        data = await $fetch('/api/dashboard/parent', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
      return data;
    } catch (error) {
      console.error('Error fetching parent dashboard:', error);
      throw error;
    }
  };

  const refreshData = async (userRole: 'student' | 'parent') => {
    // Placeholder function - will be implemented later
    console.log('refreshData called with userRole:', userRole);
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
