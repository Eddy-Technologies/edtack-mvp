<template>
 <div
 v-if="show"
 class="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]"
 @click.self="emit('close')"
 >
 <div
 class="bg-white text-zinc-800 p-6 rounded-xl shadow-md w-[90%] max-w-md text-base"
 >
 <header v-if="$slots.title" class="mb-4">
 <slot name="title" />
 </header>

 <div class="mb-6 max-h-[80vh] overflow-y-auto">
 <slot />
 </div>

 <footer v-if="$slots.footer" class="flex justify-end gap-3">
 <slot name="footer" />
 </footer>
 </div>
 </div>
</template>

<script setup lang="ts">
defineProps<{
 show: boolean;
}>();

const emit = defineEmits<{
 (e: 'close'): void;
}>();
</script>
