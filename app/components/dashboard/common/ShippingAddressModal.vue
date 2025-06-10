<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Edit Shipping Address</h2>
        <button class="text-gray-400 hover:text-gray-600" @click="closeModal">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="p-6">
        <div class="mb-4">
          <label class="flex items-center space-x-2">
            <input v-model="sameAsBilling" type="checkbox" class="rounded">
            <span class="text-sm text-gray-700">Same as billing address</span>
          </label>
        </div>
        <div v-if="!sameAsBilling">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <input v-model="addressData.street" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input v-model="addressData.city" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input v-model="addressData.state" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
          </div>
          <div class="flex space-x-4 mt-6">
            <Button variant="secondary-gray" text="Cancel" extra-classes="flex-1" @clicked="closeModal" />
            <Button variant="primary" text="Save Address" extra-classes="flex-1" @clicked="saveAddress" />
          </div>
        </div>
        <div v-else class="flex space-x-4 mt-6">
          <Button variant="secondary-gray" text="Cancel" extra-classes="flex-1" @clicked="closeModal" />
          <Button variant="primary" text="Save" extra-classes="flex-1" @clicked="saveAsBilling" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from '../../common/Button.vue';

interface Props {
  isOpen: boolean;
  currentAddress: any;
  // sameAsBilling: boolean;
}

defineProps<Props>();

const emit = defineEmits<{ (e: 'close'): void; (e: 'address-updated', address: any): void; (e: 'same-as-billing-updated', same: boolean): void }>();

const addressData = ref({ street: '', city: '', state: '', zipCode: '', country: '' });
const sameAsBilling = ref(false);

const closeModal = () => emit('close');
const updateAddress = () => {
  emit('address-updated', addressData.value);
  closeModal();
};
const saveAddress = () => {
  emit('address-updated', addressData.value);
  closeModal();
};
const saveAsBilling = () => {
  emit('same-as-billing-updated', true);
  closeModal();
};
</script>
