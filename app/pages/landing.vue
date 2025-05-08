<template>
  <div class="landing-page">
    <div class="video-container">
      <video class="w-full h-full object-cover video-element" autoplay muted loop playsinline>
        <source src="/../assets/eddy.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from '#app';

const router = useRouter();
const goToApp = () => router.push('/home');
</script>

<style scoped>
.landing-page {
  text-align: center;
  padding: 20px;
}

.video-container {
  display: flex;
  justify-content: center; /* Center the video horizontally */
  margin-top: 20px;
}

.video-element {
  max-width: 80%; /* Default width for larger screens */
}

/* Media query for mobile devices (you can adjust the breakpoint) */
@media (max-width: 768px) {
  .video-element {
    max-width: 100%; /* Make the video full width on mobile */
  }
}

.landing-btn {
  padding: 10px 20px; /* Adjust padding for better touch target */
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  white-space: nowrap; /* Prevent button text from wrapping */
}

.landing-btn:hover {
  background-color: #e2e2e2;
}
</style>
