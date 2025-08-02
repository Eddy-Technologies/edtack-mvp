<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Products</h1>
        <p class="text-gray-600 mt-2">Manage your product catalog</p>
      </div>
      <button
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        @click="openCreateModal"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4" />
        <span>Add Product</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            v-model="selectedCategory"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="selectedStatus"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span class="ml-3 text-gray-600">Loading products...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-package" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p class="text-gray-600 mb-4">Get started by creating your first product.</p>
        <button
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
          @click="openCreateModal"
        >
          Add Product
        </button>
      </div>

      <!-- Products Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12">
                    <img
                      :src="product.image_url || '/placeholder-product.png'"
                      :alt="product.name"
                      class="h-12 w-12 rounded-lg object-cover"
                    >
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500">{{ product.sku || 'No SKU' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ product.category || 'Uncategorized' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${{ (product.price_cents / 100).toFixed(2) }}</div>
                <div class="text-sm text-gray-500">{{ product.currency }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ product.stock_count }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(product.is_active)">
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  class="text-primary-600 hover:text-primary-900"
                  @click="editProduct(product)"
                >
                  Edit
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  @click="confirmDelete(product)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal -->
    <AdminProductModal
      :is-open="isModalOpen"
      :product="selectedProduct"
      @close="closeModal"
      @save="handleSaveProduct"
    />

    <!-- Delete Confirmation Modal -->
    <AdminConfirmModal
      :is-open="isDeleteModalOpen"
      title="Delete Product"
      :message="`Are you sure you want to delete '${productToDelete?.name}'? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="handleDeleteProduct"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// State
const products = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedStatus = ref('');
const isModalOpen = ref(false);
const selectedProduct = ref(null);
const isDeleteModalOpen = ref(false);
const productToDelete = ref(null);

// Computed
const categories = computed(() => {
  const cats = [...new Set(products.value.map((p) => p.category).filter(Boolean))];
  return cats.sort();
});

const filteredProducts = computed(() => {
  let filtered = products.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query)
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((p) => p.category === selectedCategory.value);
  }

  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active';
    filtered = filtered.filter((p) => p.is_active === isActive);
  }

  return filtered;
});

// Methods
const loadProducts = async () => {
  loading.value = true;
  try {
    const response = await $fetch('/api/admin/products?includeInactive=true');
    if (response.success) {
      products.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load products:', error);
    // TODO: Show error toast
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  selectedProduct.value = null;
  isModalOpen.value = true;
};

const editProduct = (product) => {
  selectedProduct.value = { ...product };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedProduct.value = null;
};

const handleSaveProduct = async (productData) => {
  try {
    if (selectedProduct.value?.id) {
      // Update existing product
      await $fetch(`/api/admin/products/${selectedProduct.value.id}`, {
        method: 'PUT',
        body: productData
      });
    } else {
      // Create new product
      await $fetch('/api/admin/products', {
        method: 'POST',
        body: productData
      });
    }

    await loadProducts();
    closeModal();
    // TODO: Show success toast
  } catch (error) {
    console.error('Failed to save product:', error);
    // TODO: Show error toast
  }
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  productToDelete.value = null;
};

const handleDeleteProduct = async () => {
  if (!productToDelete.value) return;

  try {
    await $fetch(`/api/admin/products/${productToDelete.value.id}`, {
      method: 'DELETE'
    });

    await loadProducts();
    closeDeleteModal();
    // TODO: Show success toast
  } catch (error) {
    console.error('Failed to delete product:', error);
    // TODO: Show error toast
  }
};

const getStatusBadgeClass = (isActive) => {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
  return isActive ?
    `${baseClass} bg-green-100 text-green-700` :
    `${baseClass} bg-red-100 text-red-700`;
};

// Load products on mount
onMounted(() => {
  loadProducts();
});
</script>
