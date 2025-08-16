<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar Navigation -->
    <div class="w-72 bg-white border-r border-slate-200 flex flex-col">
      <!-- Header -->
      <div class="px-6 py-6 border-b border-slate-200">
        <div class="flex items-center space-x-3">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-700 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-slate-900">StudyWithEddy</h1>
              <p class="text-xs text-slate-500">About</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-6 py-6 space-y-2">
        <div class="space-y-1">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Information</p>

          <div v-for="tab in tabs" :key="tab.id">
            <div
              :class="[
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-secondary-50 text-secondary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              ]"
              @click="switchTab(tab.id)"
            >
              <UIcon :name="tab.icon" class="w-5 h-5 mr-3" />
              {{ tab.name }}
            </div>
          </div>
        </div>
      </nav>

      <!-- Bottom Actions -->
      <div class="px-6 pb-6 space-y-4">
        <!-- Back to Chat Button -->
        <Button
          class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-secondary rounded-xl hover:bg-secondary-700 transition-colors shadow-sm"
          icon="i-lucide-message-circle"
          @click="router.push('/')"
        >
          Back to Chat
        </Button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Page Content -->
      <main class="flex-1 p-8 overflow-auto">
        <div class="max-w-7xl mx-auto">
          <!-- Tab Content -->
          <AboutTab v-if="activeTab === 'about'" />
          <FAQTab v-if="activeTab === 'faq'" />
          <FeedbackTab v-if="activeTab === 'feedback'" />
          <SubscriptionTab v-if="activeTab === 'subscription'" />
          <TeamTab v-if="activeTab === 'team'" @switch-tab="switchTab" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from '~/components/common/Button.vue';
import { useRouter, useRoute } from '#vue-router';
import AboutTab from '~/components/about/AboutTab.vue';
import FAQTab from '~/components/about/FAQTab.vue';
import FeedbackTab from '~/components/about/FeedbackTab.vue';
import SubscriptionTab from '~/components/about/SubscriptionTab.vue';
import TeamTab from '~/components/about/TeamTab.vue';

const router = useRouter();
const route = useRoute();
const selectedAvatar = ref(null);

// Tabs functionality
const activeTab = ref('about');

const tabs = ref([
  { id: 'about', name: 'About', icon: 'i-lucide-info' },
  { id: 'faq', name: 'FAQ', icon: 'i-lucide-help-circle' },
  { id: 'feedback', name: 'Feedback', icon: 'i-lucide-message-square' },
  { id: 'subscription', name: 'Subscription', icon: 'i-lucide-credit-card' },
  { id: 'team', name: 'Team', icon: 'i-lucide-users' },
]);

// Function to switch tabs and update URL
const switchTab = (tabId: string) => {
  activeTab.value = tabId;
  router.push({ query: { tab: tabId } });
};

// Handle URL query parameters for direct linking
onMounted(() => {
  const tabParam = route.query.tab as string;
  if (tabParam && ['about', 'faq', 'feedback', 'subscription', 'team'].includes(tabParam)) {
    activeTab.value = tabParam;
  }
});
</script>

<style scoped></style>
