<template>
  <Layout :user-type="userType" :user-name="userName" :user-email="userEmail" :user-avatar="userAvatar">
    <!-- Student Components -->
    <template v-if="userType === 'student'">
      <StudentProfileTab v-if="currentTab === 'profile'" />
      <StudentNotesTab v-else-if="currentTab === 'notes'" />
      <StudentSubscriptionTab v-else-if="currentTab === 'subscription'" />
      <StudentAccountTab v-else-if="currentTab === 'account'" />
      <ShopTab v-else-if="currentTab === 'shop'" />
      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
        <p class="text-gray-600">Select a section from the sidebar to get started.</p>
      </div>
    </template>

    <!-- Parent Components -->
    <template v-else>
      <ParentProfileTab v-if="currentTab === 'profile'" />
      <ParentSubscriptionTab v-else-if="currentTab === 'subscription'" />
      <ParentAccountTab v-else-if="currentTab === 'account'" />
      <ParentChildrenTab v-else-if="currentTab === 'children'" />
      <ParentPermissionsTab v-else-if="currentTab === 'permissions'" />
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
import Layout from '~/components/dashboard/Layout.vue';

// Student Components
import StudentProfileTab from '~/components/dashboard/student/ProfileTab.vue';
import StudentNotesTab from '~/components/dashboard/student/NotesTab.vue';
import StudentSubscriptionTab from '~/components/dashboard/student/SubscriptionTab.vue';
import StudentAccountTab from '~/components/dashboard/student/AccountTab.vue';

// Parent Components
import ParentProfileTab from '~/components/dashboard/parent/ProfileTab.vue';
import ParentSubscriptionTab from '~/components/dashboard/parent/SubscriptionTab.vue';
import ParentAccountTab from '~/components/dashboard/parent/AccountTab.vue';
import ParentChildrenTab from '~/components/dashboard/parent/ChildrenTab.vue';
import ParentPermissionsTab from '~/components/dashboard/parent/PermissionsTab.vue';

// Shop Components
import ShopTab from '~/components/dashboard/shop/ShopTab.vue';

definePageMeta({
  middleware: ['auth']
});

// This would normally come from user authentication/session
const userType = ref<'student' | 'parent'>('parent');
const userName = ref('Alex Johnson');
const userEmail = ref('alex.johnson@example.com');
const userAvatar = ref('/default-avatar.png');

// Get current tab from route query or default to 'profile'
const route = useRoute();
const currentTab = computed(() => {
  return (route.query.tab as string) || 'profile';
});

// Update page title based on current tab
const pageTitle = computed(() => {
  const tabTitles = {
    profile: 'Profile',
    notes: 'Notes',
    subscription: 'Subscription',
    account: 'Account',
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
