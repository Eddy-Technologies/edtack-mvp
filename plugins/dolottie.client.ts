import { defineNuxtPlugin } from '#app'
import { defineCustomElements } from '@lottiefiles/dotlottie-vue/loader'

export default defineNuxtPlugin(() => {
    defineCustomElements()
})
