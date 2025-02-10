import { defineStore } from 'pinia'
import { ref, watch } from 'vue';

export const useCreditStore = defineStore('credit', () => {
    const count = ref(0)
    const name = ref('sfxcode')
    function increment() {
        count.value++
    }

    watch(name, () => {
        count.value = 0
    })

    return { count, name, increment }
})
