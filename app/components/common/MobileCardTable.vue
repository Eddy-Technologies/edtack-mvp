<template>
  <div>
    <!-- Desktop Table View -->
    <div v-if="!isMobile" class="overflow-x-auto">
      <slot name="table" />
    </div>

    <!-- Mobile Card View -->
    <div v-else class="space-y-4">
      <div
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <!-- Card Header (optional) -->
        <div
          v-if="$slots['card-header']"
          class="px-4 py-3 bg-gray-50 border-b border-gray-100"
        >
          <slot name="card-header" :item="item" :index="index" />
        </div>

        <!-- Card Body -->
        <div class="p-4 space-y-3">
          <slot name="card-body" :item="item" :index="index">
            <!-- Default card body: render all columns as rows -->
            <div
              v-for="column in columns"
              :key="column.key"
              class="flex justify-between items-start gap-2"
            >
              <span class="text-sm text-gray-500 font-medium flex-shrink-0">
                {{ column.label }}
              </span>
              <span class="text-sm text-gray-900 text-right">
                {{ getColumnValue(item, column.key) }}
              </span>
            </div>
          </slot>
        </div>

        <!-- Card Footer / Actions (optional) -->
        <div
          v-if="$slots['card-actions']"
          class="px-4 py-3 bg-gray-50 border-t border-gray-100"
        >
          <slot name="card-actions" :item="item" :index="index" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="items.length === 0"
        class="text-center py-8 text-gray-500"
      >
        <slot name="empty">
          No items to display
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResponsive } from '~/composables/useResponsive';

interface Column {
  key: string;
  label: string;
}

const props = defineProps<{
  items: any[];
  columns?: Column[];
  itemKey?: string;
}>();

const { isMobile } = useResponsive();

// Get unique key for each item
const getItemKey = (item: any, index: number): string | number => {
  if (props.itemKey && item[props.itemKey]) {
    return item[props.itemKey];
  }
  return item.id || index;
};

// Get value from item by column key (supports nested keys like 'user.name')
const getColumnValue = (item: any, key: string): any => {
  return key.split('.').reduce((obj, k) => obj?.[k], item) ?? '-';
};
</script>
