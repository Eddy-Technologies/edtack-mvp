<template>
  <button
      class="back-button absolute top-4 left-4"
      @click="goBack"
  >
    Back
  </button>
</template>

<script>
export default {
  methods: {
    goBack() {
      this.$router.back(); // Also goes back to the previous page
    }
  }
}
</script>

<style scoped>
.back-button {
  padding: 10px 20px;
  background-color: #48bb78;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.back-button:hover {
  background-color: #48bb78;
}
</style>
