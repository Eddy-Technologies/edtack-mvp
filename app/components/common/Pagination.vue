<template>
  <div v-if="pagination" class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
    <div class="text-sm text-gray-500">
      Showing {{ ((pagination.currentPage - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.currentPage * pagination.limit, pagination.totalCount) }} of {{ pagination.totalCount }} {{ itemLabel }}
    </div>

    <div class="flex items-center space-x-2">
      <!-- Items per page selector -->
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Show:</span>
        <select
          :value="pagination.limit"
          class="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="$emit('changeLimit', parseInt(($event.target as HTMLSelectElement).value))"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>

      <!-- Page navigation -->
      <div v-if="pagination.totalPages > 1" class="flex space-x-2">
        <button
          :disabled="!pagination.hasPrevPage || isLoading"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          @click="$emit('goToPage', pagination.currentPage - 1)"
        >
          Previous
        </button>

        <span class="px-3 py-1 text-sm font-medium text-gray-700">
          Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
        </span>

        <button
          :disabled="!pagination.hasNextPage || isLoading"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          @click="$emit('goToPage', pagination.currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface Props {
  pagination: PaginationData | null;
  isLoading?: boolean;
  itemLabel?: string;
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  itemLabel: 'items'
});

defineEmits<{
  goToPage: [page: number];
  changeLimit: [limit: number];
}>();
</script>
