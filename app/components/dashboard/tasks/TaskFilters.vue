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
        ...subjects.map(s => ({ label: s.displayName, value: s.code }))
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
        { label: 'Closed', value: 'CLOSED' }
      ]"
      placeholder="Filter by status"
      class="min-w-[200px]"
    />
    <!-- Chapter Filter -->
    <USelect
      v-model="chapterFilter"
      :options="[
        { label: 'All Chapters', value: 'all' },
        { label: 'Credits Available', value: 'credits' },
        { label: 'Completed', value: 'completed' }
      ]"
      placeholder="Filter chapters"
      class="min-w-[200px]"
    />

    <!-- Sort Dropdown -->
    <USelect
      v-model="sort"
      :options="[
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' }
      ]"
      placeholder="Sort by"
      class="min-w-[200px]"
    />

    <!-- Clear Filters -->
    <UButton
      v-if="hasActiveFilters"
      variant="ghost"
      icon="i-lucide-x"
      @click="handleClear"
    >
      Clear
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
  subjects: Array<{ code: string; displayName: string }>;
}

const props = defineProps<Props>();
const emit = defineEmits(['clear']);

const child = defineModel('child', { type: String, default: 'all' });
const subject = defineModel('subject', { type: String, default: 'all' });
const status = defineModel('status', { type: String, default: 'all' });
const chapterFilter = defineModel('chapterFilter', { type: String, default: 'all' });
const sort = defineModel('sort', { type: String, default: 'all' });

const hasActiveFilters = computed(() => {
  const hasChild = props.showChildFilter && child.value !== 'all';
  const hasSubject = subject.value !== 'all';
  const hasStatus = status.value !== 'all';
  const hasChapterFilter = chapterFilter.value !== 'all';
  const hasSort = sort.value !== 'newest';

  return hasChild || hasSubject || hasStatus || hasChapterFilter || hasSort;
});

const handleClear = () => {
  child.value = 'all';
  subject.value = 'all';
  status.value = 'all';
  chapterFilter.value = 'all';
  sort.value = 'newest';
  emit('clear');
};
</script>
