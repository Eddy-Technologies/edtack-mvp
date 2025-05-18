import { defineCustomElements } from '@lottiefiles/dotlottie-vue/loader';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
  defineCustomElements();
});
