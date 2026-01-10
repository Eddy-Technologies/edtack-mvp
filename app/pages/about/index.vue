<template>
  <div class="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
    <!-- Mobile Header with Hamburger -->
    <div
      v-if="isMobile"
      class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between lg:hidden"
    >
      <button
        class="p-2.5 -ml-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
        aria-label="Open menu"
        @click="isDrawerOpen = true"
      >
        <UIcon name="i-lucide-menu" class="w-6 h-6 text-slate-700" />
      </button>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-xs">E</span>
        </div>
        <span class="text-base font-semibold text-slate-900">About</span>
      </div>
      <div class="w-10" />
    </div>

    <!-- Mobile Drawer -->
    <MobileDrawer :visible="isDrawerOpen && isMobile" @close="isDrawerOpen = false">
      <div class="flex flex-col h-full bg-white">
        <!-- Drawer Header -->
        <div class="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2" @click="isDrawerOpen = false">
            <div class="w-7 h-7 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xs">E</span>
            </div>
            <span class="text-base font-semibold text-slate-900">StudyWithEddy</span>
          </NuxtLink>
          <button class="p-2 rounded-xl hover:bg-slate-100" @click="isDrawerOpen = false">
            <UIcon name="i-lucide-x" class="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <!-- Drawer Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Information</p>
          <div
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'flex items-center px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all',
              activeTab === tab.id ? 'bg-secondary-50 text-secondary-700' : 'text-slate-600 hover:bg-slate-100'
            ]"
            @click="handleMobileNavigate(tab.id)"
          >
            <UIcon :name="tab.icon" class="w-5 h-5 mr-3" />
            {{ tab.name }}
          </div>

          <!-- User Guides Section in Drawer -->
          <div>
            <div
              :class="[
                'flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all',
                activeTab === 'user-guides' || isUserGuidesOpen
                  ? 'bg-secondary-50 text-secondary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              ]"
              @click="toggleUserGuides"
            >
              <div class="flex items-center">
                <UIcon name="i-lucide-book-open" class="w-5 h-5 mr-3" />
                <span>User Guides</span>
              </div>
              <UIcon
                name="i-lucide-chevron-down"
                :class="['w-4 h-4 transition-transform duration-300', isUserGuidesOpen ? 'rotate-180' : '']"
              />
            </div>
            <div v-if="isUserGuidesOpen" class="ml-5 mt-2 space-y-1 pl-4 border-l-2 border-slate-100">
              <div
                v-for="guide in userGuides"
                :key="guide.id"
                :class="[
                  'flex items-center px-3 py-2.5 text-sm rounded-xl cursor-pointer transition-all',
                  activeTab === 'user-guides' && activeGuide === guide.id
                    ? 'bg-secondary-50/80 text-secondary-700 font-medium'
                    : 'text-slate-500 hover:bg-white/80 hover:text-slate-700'
                ]"
                @click="handleMobileGuideNavigate(guide.id)"
              >
                <UIcon :name="guide.icon" class="w-4 h-4 mr-2.5" />
                <span>{{ guide.name }}</span>
              </div>
            </div>
          </div>
        </nav>

        <!-- Drawer Footer -->
        <div class="px-4 py-4 border-t border-slate-200">
          <Button
            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl"
            icon="i-lucide-message-circle"
            @clicked="handleBackToChat"
          >
            Back to Chat
          </Button>
        </div>
      </div>
    </MobileDrawer>

    <!-- Desktop Sidebar Navigation (hidden on mobile) -->
    <div class="hidden lg:flex w-72 bg-white border-r border-slate-200/60 flex-col shadow-sm">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50/50">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
            <span class="text-white font-bold text-base">E</span>
          </div>
          <div>
            <h1 class="text-lg font-heading font-semibold text-slate-900">StudyWithEddy</h1>
            <p class="text-xs text-slate-400 font-medium tracking-wide">About</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 overflow-y-auto">
        <div class="space-y-1.5">
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 py-2">Information</p>

          <div v-for="tab in tabs" :key="tab.id">
            <div
              :class="[
                'group flex items-center px-4 py-3 text-sm font-medium rounded-2xl cursor-pointer transition-all duration-300',
                activeTab === tab.id
                  ? 'bg-white text-secondary-700 shadow-sm ring-1 ring-slate-100'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'
              ]"
              @click="switchTab(tab.id)"
            >
              <UIcon :name="tab.icon" class="w-5 h-5 mr-3" />
              {{ tab.name }}
            </div>
          </div>

          <!-- User Guides Expandable Section -->
          <div>
            <!-- Parent User Guides Item -->
            <div
              :class="[
                'group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-2xl cursor-pointer transition-all duration-300',
                activeTab === 'user-guides' || isUserGuidesOpen
                  ? 'bg-white text-secondary-700 shadow-sm ring-1 ring-slate-100'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'
              ]"
              @click="toggleUserGuides"
            >
              <div class="flex items-center">
                <UIcon name="i-lucide-book-open" class="w-5 h-5 mr-3" />
                <span>User Guides</span>
              </div>
              <UIcon
                name="i-lucide-chevron-down"
                :class="[
                  'w-4 h-4 transition-transform duration-300',
                  isUserGuidesOpen ? 'rotate-180' : ''
                ]"
              />
            </div>

            <!-- Submenu with smooth animation -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="isUserGuidesOpen" class="overflow-hidden">
                <div class="ml-5 mt-2 space-y-1 pl-4 border-l-2 border-slate-100">
                  <div
                    v-for="guide in userGuides"
                    :key="guide.id"
                    :class="[
                      'flex items-center px-3 py-2.5 text-sm rounded-xl cursor-pointer transition-all duration-200',
                      activeTab === 'user-guides' && activeGuide === guide.id
                        ? 'bg-secondary-50/80 text-secondary-700 font-medium'
                        : 'text-slate-500 hover:bg-white/80 hover:text-slate-700'
                    ]"
                    @click="switchToGuide(guide.id)"
                  >
                    <UIcon :name="guide.icon" class="w-4 h-4 mr-2.5" />
                    <span>{{ guide.name }}</span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </nav>

      <!-- Bottom Actions -->
      <div class="px-4 pb-6 pt-4">
        <Button
          class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-300 shadow-lg shadow-secondary-500/20 hover:shadow-xl hover:shadow-secondary-500/30 hover:-translate-y-0.5"
          icon="i-lucide-message-circle"
          @clicked="router.push('/')"
        >
          Back to Chat
        </Button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Page Content -->
      <main :class="['flex-1 overflow-auto', isMobile ? 'pt-20 p-4' : 'px-8 py-10']">
        <div class="max-w-5xl mx-auto">
          <!-- Tab Content -->
          <AboutTab v-if="activeTab === 'about'" />
          <UserGuidesTab v-if="activeTab === 'user-guides'" :active-guide="activeGuide" />
          <FAQTab v-if="activeTab === 'faq'" />
          <FeedbackTab v-if="activeTab === 'feedback'" />
          <!-- <SubscriptionTab v-if="activeTab === 'subscription'" /> -->
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
import UserGuidesTab from '~/components/about/UserGuidesTab.vue';
import FAQTab from '~/components/about/FAQTab.vue';
import FeedbackTab from '~/components/about/FeedbackTab.vue';
import TeamTab from '~/components/about/TeamTab.vue';
import MobileDrawer from '~/components/common/MobileDrawer.vue';
import { useResponsive } from '~/composables/useResponsive';

const router = useRouter();
const route = useRoute();

// Mobile responsive state
const { isMobile } = useResponsive();
const isDrawerOpen = ref(false);

// Tabs functionality
const activeTab = ref('about');
const activeGuide = ref('getting-started');
const isUserGuidesOpen = ref(false);

const tabs = ref([
  { id: 'about', name: 'About', icon: 'i-lucide-info' },
  { id: 'faq', name: 'FAQ', icon: 'i-lucide-help-circle' },
  { id: 'feedback', name: 'Feedback', icon: 'i-lucide-message-square' },
  // { id: 'subscription', name: 'Subscription', icon: 'i-lucide-credit-card' },
  { id: 'team', name: 'Team', icon: 'i-lucide-users' },
]);

const userGuides = ref([
  { id: 'getting-started', name: 'Getting Started', icon: 'i-lucide-play-circle' },
  { id: 'for-parents', name: 'For Parents', icon: 'i-lucide-users' },
  { id: 'for-students', name: 'For Students', icon: 'i-lucide-graduation-cap' },
  { id: 'credits-rewards', name: 'Credits & Rewards', icon: 'i-lucide-coins' },
  { id: 'family-features', name: 'Family Features', icon: 'i-lucide-home' },
]);

// Function to switch tabs and update URL
const switchTab = (tabId: string) => {
  activeTab.value = tabId;
  if (tabId !== 'user-guides') {
    isUserGuidesOpen.value = false;
  }
  router.push({ query: { tab: tabId } });
};

// Function to toggle user guides
const toggleUserGuides = () => {
  if (activeTab.value === 'user-guides' && isUserGuidesOpen.value) {
    // If already open and active, close it
    isUserGuidesOpen.value = false;
    activeTab.value = 'about';
    router.push({ query: {} });
  } else {
    // Open user guides
    isUserGuidesOpen.value = true;
    activeTab.value = 'user-guides';
    router.push({ query: { tab: 'user-guides', guide: activeGuide.value } });
  }
};

// Function to switch to specific guide
const switchToGuide = (guideId: string) => {
  activeTab.value = 'user-guides';
  activeGuide.value = guideId;
  isUserGuidesOpen.value = true;
  router.push({ query: { tab: 'user-guides', guide: guideId } });
};

// Mobile navigation helpers
const handleMobileNavigate = (tabId: string) => {
  switchTab(tabId);
  isDrawerOpen.value = false;
};

const handleMobileGuideNavigate = (guideId: string) => {
  switchToGuide(guideId);
  isDrawerOpen.value = false;
};

const handleBackToChat = () => {
  isDrawerOpen.value = false;
  router.push('/');
};

// Handle URL query parameters for direct linking
onMounted(() => {
  const tabParam = route.query.tab as string;
  if (tabParam && ['about', 'faq', 'feedback', 'subscription', 'team'].includes(tabParam)) {
    activeTab.value = tabParam;
  }

  // Handle guide parameter
  const guideParam = route.query.guide as string;
  if (guideParam && ['getting-started', 'for-parents', 'for-students', 'credits-rewards', 'family-features'].includes(guideParam)) {
    activeTab.value = 'user-guides';
    activeGuide.value = guideParam;
    isUserGuidesOpen.value = true;
  }
});
</script>

<style scoped></style>
