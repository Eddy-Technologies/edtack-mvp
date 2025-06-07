<template>
  <aside class="h-full flex flex-col border-r">
    <!-- Header -->
    <div class="p-4 flex items-center justify-between border-b">
      <span v-if="!collapsed" class="text-lg font-semibold">New Chat</span>
      <Button
        v-if="!collapsed"
        text=""
        icon="i-heroicons-arrow-left-20-solid"
        color="black"
        size="l"
        bold
        rounded
        hover
        extra-classes="p-2 rounded-full hover:bg-gray-800"
        @click="toggleSidebar"
      />
      <Button
        v-else
        text=""
        icon="i-heroicons-arrow-right-20-solid"
        color="black"
        size="l"
        bold
        rounded
        hover
        extra-classes="p-2 rounded-full hover:bg-gray-800"
        @click="toggleSidebar"
      />
    </div>

    <!-- Main Scrollable Content -->
    <div class="flex-1 p-4 overflow-y-auto">
      <div class="text-gray-500 mb-4">Chat History</div>

      <div class="relative w-[400px] h-[800px] mx-auto bg-gray-600 rounded-xl shadow-inner p-2">
        <img src="/snorlax.gif" alt="Snorlax" class="w-full h-full object-contain">

        <!-- Floating action buttons -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-4 mb-6">
          <Button
            text=""
            icon="i-heroicons-phone-20-solid"
            color="green"
            size="l"
            bold
            rounded
            hover
            extra-classes="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg"
            @click="handleCall"
          />
          <Button
            text=""
            icon="i-heroicons-microphone-20-solid"
            color="gray"
            size="l"
            bold
            rounded
            hover
            extra-classes="bg-gray-300 hover:bg-gray-400 rounded-full p-4 shadow-lg"
            @click="handleMute"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import Button from '~/components/common/Button.vue';

const emit = defineEmits(['toggle-sidebar']);
defineProps({ collapsed: Boolean }); // optional if you want to conditionally hide labels, etc.

const toast = useToast();

const handleCall = () => {
  toast.add({
    title: 'Call Action',
    description: 'Call button pressed.',
    icon: 'i-heroicons-phone-20-solid',
  });
};

const handleMute = () => {
  toast.add({
    title: 'Mute Action',
    description: 'Mute button pressed.',
    icon: 'i-heroicons-microphone-slash-20-solid',
  });
};

const toggleSidebar = () => {
  emit('toggle-sidebar');
};
</script>
