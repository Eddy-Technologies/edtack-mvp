<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button class="text-primary-600 hover:text-primary-700" @click="goBack">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m0 7h18"
                />
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
          </div>
          <div class="text-sm text-gray-500">
            Last updated: {{ lastUpdated }}
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <div class="prose prose-gray max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Eddy (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Eddy is an AI-powered educational platform that provides personalized learning experiences for students. Our service includes:
          </p>
          <ul>
            <li>AI tutoring sessions with customized learning paths</li>
            <li>Interactive educational content across multiple subjects</li>
            <li>Progress tracking and analytics</li>
            <li>Parental controls and monitoring tools</li>
            <li>Educational games and activities</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the Service, you must create an account. You are responsible for:
          </p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring the accuracy of information provided during registration</li>
            <li>Notifying us immediately of any unauthorized use of your account</li>
          </ul>

          <h2>4. Privacy and Data Protection</h2>
          <p>
            We are committed to protecting your privacy and the privacy of students using our platform:
          </p>
          <ul>
            <li>We collect only necessary information to provide our services</li>
            <li>Student data is protected with advanced security measures</li>
            <li>We never sell or share personal information with third parties for marketing purposes</li>
            <li>Parents have full control over their child's data and can request deletion at any time</li>
            <li>All data processing complies with applicable privacy laws</li>
          </ul>

          <h2>5. Acceptable Use</h2>
          <p>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Attempt to gain unauthorized access to any portion of the Service</li>
            <li>Upload or transmit any harmful, offensive, or inappropriate content</li>
            <li>Interfere with or disrupt the Service or servers connected to the Service</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
          </ul>

          <h2>6. Content and Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Eddy and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2>7. Subscription and Payment</h2>
          <p>
            Some features of the Service require a paid subscription:
          </p>
          <ul>
            <li>Subscription fees are billed in advance on a monthly or yearly basis</li>
            <li>All fees are non-refundable except as required by law</li>
            <li>You may cancel your subscription at any time</li>
            <li>Price changes will be communicated in advance</li>
            <li>Failure to pay may result in suspension or termination of your account</li>
          </ul>

          <h2>8. Child Safety</h2>
          <p>
            The safety of children using our platform is our highest priority:
          </p>
          <ul>
            <li>Our AI is specifically designed for educational purposes</li>
            <li>Content is filtered for age-appropriateness</li>
            <li>We provide parental controls and monitoring tools</li>
            <li>Any inappropriate behavior is immediately reported and addressed</li>
            <li>We comply with all applicable child protection laws</li>
          </ul>

          <h2>9. Disclaimers</h2>
          <p>
            While we strive to provide accurate and helpful educational content:
          </p>
          <ul>
            <li>The Service is provided "as is" without warranties of any kind</li>
            <li>We do not guarantee that the Service will be error-free or uninterrupted</li>
            <li>Educational content is for supplementary purposes only</li>
            <li>We are not responsible for any decisions made based on information from the Service</li>
          </ul>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Eddy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be interpreted and governed by the laws of Singapore, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Singapore.
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
          </p>

          <h2>14. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us at:
          </p>
          <ul>
            <li>Email: support@eddy.ai</li>
            <li>Address: Singapore</li>
          </ul>

          <div class="mt-8 p-4 bg-primary-50 rounded-lg">
            <p class="text-sm text-primary-800">
              <strong>Note:</strong> By using Eddy, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const lastUpdated = 'January 16, 2024';

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
};

// SEO Meta
useHead({
  title: 'Terms and Conditions - Eddy',
  meta: [
    {
      name: 'description',
      content: 'Terms and Conditions for Eddy - AI-powered educational platform for students and parents.'
    }
  ]
});
</script>

<style scoped>
.prose h2 {
  @apply text-xl font-semibold text-gray-900 mt-8 mb-4;
}

.prose p {
  @apply text-gray-700 mb-4 leading-relaxed;
}

.prose ul {
  @apply mb-4 pl-6;
}

.prose li {
  @apply text-gray-700 mb-2 list-disc;
}

.prose strong {
  @apply font-semibold text-gray-900;
}
</style>
