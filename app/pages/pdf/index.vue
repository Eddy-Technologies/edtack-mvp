<template>
  <AppHeader />
  <div class="app">
    <input
      type="file"
      accept=".pdf"
      class="file-uploader"
      @change="handleFileUpload"
    >
  </div>
</template>

<script>
import { useFileUploadGP } from '~/composables/useFileUploadGP.js';

export default {
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const result = await useFileUploadGP(file);
        console.log('Gemini Result:', result);
        // Handle the result (e.g., display it to the user)
      } else {
        console.log('No file selected.');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.file-uploader {
  padding: 10px;
  margin: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}

.file-uploader::-webkit-file-upload-button {
  background-color: #00dc82;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.file-uploader::-webkit-file-upload-button:hover {
  background-color: #00b36e;
}
</style>
