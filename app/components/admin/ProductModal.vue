<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
          {{ product?.id ? 'Edit Product' : 'Create Product' }}
        </h2>
        <button
          class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          @click="closeModal"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Modal Content -->
      <form class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]" @submit.prevent="handleSubmit">
        <div class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter product name"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                v-model="form.sku"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter SKU"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter product description"
            />
          </div>

          <!-- Product Type and Category -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Product Type *
              </label>
              <select
                v-model="form.product_type"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select type</option>
                <option value="physical">Physical Product</option>
                <option value="digital">Digital Product</option>
                <option value="subscription">Subscription</option>
                <option value="credits">Credits</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                v-model="form.category"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter category"
              >
            </div>
          </div>

          <!-- Pricing -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Price (SGD) *
              </label>
              <input
                v-model.number="priceInDollars"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Stock Count
              </label>
              <input
                v-model.number="form.stock_count"
                type="number"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                v-model="form.currency"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="SGD">SGD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              v-model="form.image_url"
              type="url"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://example.com/image.jpg"
            >
          </div>

          <!-- Discount Settings -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Discount Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  v-model.number="form.discount_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount (SGD)
                </label>
                <input
                  v-model.number="discountInDollars"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                >
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Discount Start Date
                </label>
                <input
                  v-model="form.discount_start_date"
                  type="datetime-local"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Discount End Date
                </label>
                <input
                  v-model="form.discount_end_date"
                  type="datetime-local"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="flex items-center">
            <input
              id="is_active"
              v-model="form.is_active"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <label for="is_active" class="ml-2 block text-sm text-gray-900">
              Product is active
            </label>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ product?.id ? 'Update Product' : 'Create Product' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

// Form data
const form = ref({
  name: '',
  description: '',
  product_type: '',
  price_cents: 0,
  currency: 'SGD',
  image_url: '',
  category: '',
  stock_count: 0,
  sku: '',
  discount_percentage: null,
  discount_amount_cents: null,
  discount_start_date: '',
  discount_end_date: '',
  is_active: true,
  metadata: {}
});

// Computed for dollar amounts (easier for users)
const priceInDollars = computed({
  get: () => form.value.price_cents / 100,
  set: (value) => {
    form.value.price_cents = Math.round((value || 0) * 100);
  }
});

const discountInDollars = computed({
  get: () => (form.value.discount_amount_cents || 0) / 100,
  set: (value) => {
    form.value.discount_amount_cents = value ? Math.round(value * 100) : null;
  }
});

const isFormValid = computed(() => {
  return form.value.name && form.value.product_type && form.value.price_cents > 0;
});

// Watch for product changes to populate form
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = {
      name: newProduct.name || '',
      description: newProduct.description || '',
      product_type: newProduct.product_type || '',
      price_cents: newProduct.price_cents || 0,
      currency: newProduct.currency || 'SGD',
      image_url: newProduct.image_url || '',
      category: newProduct.category || '',
      stock_count: newProduct.stock_count || 0,
      sku: newProduct.sku || '',
      discount_percentage: newProduct.discount_percentage || null,
      discount_amount_cents: newProduct.discount_amount_cents || null,
      discount_start_date: newProduct.discount_start_date || '',
      discount_end_date: newProduct.discount_end_date || '',
      is_active: newProduct.is_active !== false,
      metadata: newProduct.metadata || {}
    };
  } else {
    // Reset form for new product
    form.value = {
      name: '',
      description: '',
      product_type: '',
      price_cents: 0,
      currency: 'SGD',
      image_url: '',
      category: '',
      stock_count: 0,
      sku: '',
      discount_percentage: null,
      discount_amount_cents: null,
      discount_start_date: '',
      discount_end_date: '',
      is_active: true,
      metadata: {}
    };
  }
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!isFormValid.value) return;

  emit('save', { ...form.value });
};
</script>
