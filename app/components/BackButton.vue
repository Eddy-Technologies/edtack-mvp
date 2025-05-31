<template>
 <button
 class="absolute top-4 left-4 px-5 py-2.5 bg-green-500 text-white border-none rounded-md cursor-pointer text-base hover:bg-green-600"
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
};
</script>
