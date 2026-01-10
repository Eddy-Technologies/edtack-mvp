/**
 * Tour step definitions for onboarding tours
 */

export interface TourStep {
  id: string;
  element: string; // CSS selector (data-tour attribute)
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  // Callback to run before showing this step (e.g., open sidebar)
  onBeforeShow?: () => Promise<void> | void;
}

export interface TourConfig {
  id: string;
  steps: TourStep[];
}

// Chat Tour - Mobile version (all steps in sidebar)
export const CHAT_TOUR_MOBILE: TourConfig = {
  id: 'chat-tour',
  steps: [
    {
      id: 'character-carousel',
      element: '[data-tour="character-carousel"]',
      title: 'Choose Your Character',
      description: 'Select a character to help you learn. Each specializes in different subjects.',
      position: 'bottom',
    },
    {
      id: 'chat-input',
      element: '[data-tour="chat-input"]',
      title: 'Start a Conversation',
      description: 'Type your question here or use the quick prompts to get started by clicking on the buttons.',
      position: 'top',
    },
    {
      id: 'mobile-study',
      element: '[data-tour="mobile-study"]',
      title: 'Study Materials',
      description: 'Access your lessons, practices and quizzes here.',
      position: 'left',
    },
    {
      id: 'mobile-profile',
      element: '[data-tour="mobile-profile"]',
      title: 'Your Profile',
      description: 'Access other features like your settings and credits here',
      position: 'left',
    },
  ],
};

// Chat Tour - Desktop version (5 steps - shows menu opening)
export const CHAT_TOUR_DESKTOP: TourConfig = {
  id: 'chat-tour',
  steps: [
    {
      id: 'character-carousel',
      element: '[data-tour="character-carousel"]',
      title: 'Choose Your Character',
      description: 'Select a character to help you learn. Each specializes in different subjects.',
      position: 'bottom',
    },
    {
      id: 'chat-input',
      element: '[data-tour="chat-input"]',
      title: 'Start a Conversation',
      description: 'Type your question here or use the quick prompts to get started by clicking on the buttons.',
      position: 'top',
    },
    {
      id: 'desktop-menu',
      element: '[data-tour="auth-widget"]',
      title: 'Your Menu',
      description: 'Click here to access your profile, study materials, and settings.',
      position: 'top',
    },
    {
      id: 'desktop-study',
      element: '[data-tour="desktop-study"]',
      title: 'Study Materials',
      description: 'Access your lessons, practices and quizzes here.',
      position: 'left',
    },
    {
      id: 'desktop-profile',
      element: '[data-tour="desktop-profile"]',
      title: 'Your Profile',
      description: 'Access other features like your settings and credits here',
      position: 'left',
    },
  ],
};

// Dashboard Tour - Same for mobile and desktop
export const DASHBOARD_TOUR: TourConfig = {
  id: 'dashboard-tour',
  steps: [
    {
      id: 'study-tab',
      element: '[data-tour="study-tab"]',
      title: 'Study Materials',
      description: 'Access all your lessons, practices and quizzes organised by subject.',
      position: 'right',
    },
    {
      id: 'credits-tab',
      element: '[data-tour="credits-tab"]',
      title: 'Your Credits',
      description: 'View your credit balance and transaction history. Parents can manage credit top-ups here. Students can redeem credits for products.',
      position: 'right',
    },
    {
      id: 'tasks-tab',
      element: '[data-tour="tasks-tab"]',
      title: 'Tasks',
      description: 'Track your assignments and tasks to stay on top of your learning. Completing tasks gives you credits.',
      position: 'right',
    },
  ],
};
