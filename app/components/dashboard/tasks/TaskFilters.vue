<script setup lang="ts">
import { getDisplayFullName } from '~/utils/avatarUtils';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  showChildFilter: boolean;
  children: Child[];
  subjects: string[];
}

defineProps<Props>();
const emit = defineEmits(['clear']);

const child = defineModel('child', { type: String, default: 'all' });
const subject = defineModel('subject', { type: String, default: 'all' });
const status = defineModel('status', { type: String, default: 'all' });
const creditRange = defineModel('creditRange', { type: Object, default: () => ({ min: 0, max: 1000 }) });
const sort = defineModel('sort', { type: String, default: 'newest' });

const showCreditFilter = ref(false);

const handleClear = () => {
  child.value = 'all';
  subject.value = 'all';
  status.value = 'all';
  creditRange.value = { min: 0, max: 1000 };
  sort.value = 'newest';
  emit('clear');
};
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- Child Filter (Parent Only) -->
    <USelect
      v-if="showChildFilter"
      v-model="child"
      :options="[
        { label: 'All Children', value: 'all' },
        ...children.map(c => ({
          label: getDisplayFullName(c.firstName, c.lastName, c.email),
          value: c.id
        }))
      ]"
      placeholder="Filter by child"
      class="min-w-[200px]"
    />

    <!-- Subject Filter -->
    <USelect
      v-model="subject"
      :options="[
        { label: 'All Subjects', value: 'all' },
        ...subjects.map(s => ({ label: s, value: s }))
      ]"
      placeholder="Filter by subject"
      class="min-w-[200px]"
    />

    <!-- Status Filter -->
    <USelect
      v-model="status"
      :options="[
        { label: 'All Statuses', value: 'all' },
        { label: 'Open', value: 'OPEN' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Closed', value: 'CLOSED' }
      ]"
      placeholder="Filter by status"
      class="min-w-[200px]"
    />

    <!-- Credit Range Filter -->
    <UPopover v-model:open="showCreditFilter">
      <UButton variant="outline" icon="i-lucide-coins">
        Credits: {{ creditRange.min }}-{{ creditRange.max }}
      </UButton>

      <template #panel>
        <div class="p-4 space-y-4 min-w-[300px]">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">
              Minimum Credits
            </label>
            <UInput
              v-model.number="creditRange.min"
              type="number"
              min="0"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">
              Maximum Credits
            </label>
            <UInput
              v-model.number="creditRange.max"
              type="number"
              min="0"
            />
          </div>

          <UButton
            block
            @click="showCreditFilter = false"
          >
            Apply
          </UButton>
        </div>
      </template>
    </UPopover>

    <!-- Sort Dropdown -->
    <USelect
      v-model="sort"
      :options="[
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
        { label: 'Credits: Low to High', value: 'credits-asc' },
        { label: 'Credits: High to Low', value: 'credits-desc' }
      ]"
      placeholder="Sort by"
      class="min-w-[200px]"
    />

    <!-- Clear Filters -->
    <UButton
      variant="ghost"
      icon="i-lucide-x"
      @click="handleClear"
    >
      Clear
    </UButton>
  </div>
</template>
