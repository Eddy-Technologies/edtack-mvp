<template>
  <Layout
    :user-type="userType"
    :user-name="userName"
    :user-email="userEmail"
    :user-avatar="userAvatar"
    :student-pays-for-subscription="studentPaysForSubscription"
  >
    <!-- Student Components -->
    <template v-if="userType === 'student'">
      <StudentOverviewTab v-if="currentTab === 'overview'" />
      <StudentNotesTab v-else-if="currentTab === 'notes'" />
      <StudentSubscriptionTab v-else-if="currentTab === 'subscription' && studentPaysForSubscription" />
      <StudentAccountTab v-else-if="currentTab === 'account'" />
      <SecurityTab v-else-if="currentTab === 'security'" />
      <ShopTab v-else-if="currentTab === 'shop'" />
      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
        <p class="text-gray-600">Select a section from the sidebar to get started.</p>
      </div>
    </template>

    <!-- Parent Components -->
    <template v-else>
      <ParentOverviewTab v-if="currentTab === 'overview'" />
      <ParentSubscriptionTab v-else-if="currentTab === 'subscription'" />
      <ParentAccountTab v-else-if="currentTab === 'account'" />
      <ParentChildrenTab v-else-if="currentTab === 'children'" />
      <ParentPermissionsTab v-else-if="currentTab === 'permissions'" />
      <SecurityTab v-else-if="currentTab === 'security'" />
      <ShopTab v-else-if="currentTab === 'shop'" />
      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Family Dashboard</h2>
        <p class="text-gray-600">Select a section from the sidebar to manage your family's learning journey.</p>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import placeholder1 from '../../../../assets/default-avatar.png';
import Layout from '~/components/dashboard/Layout.vue';

// Student Components
import StudentOverviewTab from '~/components/dashboard/student/OverviewTab.vue';
import StudentNotesTab from '~/components/dashboard/student/NotesTab.vue';
import StudentSubscriptionTab from '~/components/dashboard/student/SubscriptionTab.vue';
import StudentAccountTab from '~/components/dashboard/student/AccountTab.vue';

// Parent Components
import ParentOverviewTab from '~/components/dashboard/parent/OverviewTab.vue';
import ParentSubscriptionTab from '~/components/dashboard/parent/SubscriptionTab.vue';
import ParentAccountTab from '~/components/dashboard/parent/AccountTab.vue';
import ParentChildrenTab from '~/components/dashboard/parent/ChildrenTab.vue';
import ParentPermissionsTab from '~/components/dashboard/parent/PermissionsTab.vue';

// Shop Components
import ShopTab from '~/components/dashboard/shop/ShopTab.vue';

// Shared Components
import SecurityTab from '~/components/dashboard/common/SecurityTab.vue';

definePageMeta({
  middleware: ['auth']
});

// This would normally come from user authentication/session
const userType = ref<'student' | 'parent'>('student');
const userName = ref('Alex Johnson');
const userEmail = ref('alex.johnson@example.com');
const userAvatar = ref(placeholder1);

// Student payment responsibility - would come from user/subscription data
const studentPaysForSubscription = ref(true); // Set to true if student pays, false if parent pays

// Get current tab from route query or default to 'profile'
const route = useRoute();
const currentTab = computed(() => {
  return (route.query.tab as string) || 'profile';
});

// Update page title based on current tab
const pageTitle = computed(() => {
  const tabTitles = {
    overview: 'Overview',
    notes: 'Notes',
    subscription: 'Subscription',
    account: 'Account',
    security: 'Security',
    children: 'Children',
    permissions: 'Permissions',
    shop: 'Shop'
  };
  return tabTitles[currentTab.value as keyof typeof tabTitles] || 'Dashboard';
});

// Set page title
useHead({
  title: () => `${pageTitle.value} - Dashboard`
});
</script>
