<template>
  <div class="landing-page">
    <div class="header-container">
      <div class="landing-message">
        <h1 class="text-xl md:text-2xl text-primary header">
          Educational platform <br>
          where parents can incentivise<br>
          their children for motivated consistent learning.
        </h1>
      </div>
      <button
          class="landing-btn text-l md:text-xl text-primary font-bold"
          @click="goToApp"
      >
        Try Eddy Now
      </button>
    </div>
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

.header-container {
  display: flex;
  justify-content: space-between; /* Space out header and button */
  align-items: flex-start; /* Align items to the top */
  max-width: 70%; /* Match video width */
  margin: 0 auto; /* Center the container */
  margin-bottom: 20px; /* Keep the bottom margin */
  padding: 0 10px; /* Add some side padding for smaller screens */
}

.landing-message {
  text-align: left; /* Align text to the left */
  font-family: Georgia, sans-serif;
}

.video-container {
  display: flex;
  justify-content: center; /* Center the video horizontally */
  margin-top: 20px;
}

.video-element {
  max-width: 70%; /* Default width for larger screens */
}

/* Media query for mobile devices (you can adjust the breakpoint) */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column; /* Stack header and button on mobile */
    align-items: center; /* Center items horizontally on mobile */
    text-align: center; /* Center text on mobile */
    max-width: 100%;
    margin-top: 50px; /* Adjust top margin for mobile */
    margin-bottom: 30px; /* Adjust bottom margin for mobile */
    padding: 0 15px;
  }

  .landing-message {
    text-align: center; /* Center text on mobile */
    margin-bottom: 20px; /* Add space between text and button on mobile */
  }

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
