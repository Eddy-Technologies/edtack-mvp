<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <!-- Eddy Logo -->
      <div class="mb-6">
        <img src="/logo.png" alt="Eddy" class="w-16 h-16 mx-auto">
      </div>

      <!-- Status Code -->
      <div class="mb-4">
        <h1 class="text-9xl font-heading font-bold text-primary-600 mb-4">
          {{ error?.statusCode || 'Error' }}
        </h1>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-heading font-semibold text-gray-900 mb-3">
        {{ getTitle() }}
      </h2>

      <!-- Actions -->
      <div class="space-y-3">
        <Button
          text="Go Home"
          variant="primary"
          size="lg"
          class="w-full"
          @clicked="goHome"
        />
        <button
          class="w-full px-4 py-2 text-white bg-primary border border-primary-200 rounded-lg hover:bg-primary/90 transition-colors duration-200"
          @click="goBack"
        >
          Go Back
        </button>
      </div>

      <!-- Support Contact -->
      <p class="text-sm text-gray-500 my-4">
        Contact support at <a
          href="mailto:eddytech.ai@gmail.com"
          class="text-primary-600 hover:text-primary-700 underline"
        >eddytech.ai@gmail.com
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['error']);

const getTitle = () => {
  switch (props.error?.statusCode) {
    case 404:
      return 'Page Not Found';
    case 403:
      return 'Access Denied';
    case 429:
      return 'Too Many Requests';
    default:
      return 'Something Went Wrong';
  }
};

const getMessage = () => {
  if (props.error?.statusMessage) {
    return props.error.statusMessage;
  }

  switch (props.error?.statusCode) {
    case 404:
      return 'The page you are looking for could not be found. It might have been moved, deleted, or you entered the wrong URL.';
    case 403:
      return 'You do not have permission to access this resource. Please contact support if you believe this is an error.';
    case 429:
      return 'You have made too many requests in a short period. Please wait a moment and try again.';
    default:
      return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
};

const goHome = () => {
  window.location.href = '/';
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    goHome();
  }
};
</script>
