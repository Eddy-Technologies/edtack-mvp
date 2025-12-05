<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Subjects</h1>
        <p class="text-gray-600 mt-2">Manage subject availability and settings</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search subjects..."
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="selectedStatus"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Subjects Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span class="ml-3 text-gray-600">Loading subjects...</span>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="subject in filteredSubjects" :key="subject.name">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ subject.display_name }}</div>
              <div class="text-sm text-gray-500">{{ subject.description }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ subject.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ subject.country_code }}</td>
            <td class="px-6 py-4">
              <span :class="getStatusBadgeClass(subject.is_active)">
                {{ subject.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button
                class="text-primary-600 hover:text-primary-900 text-sm font-medium"
                @click="toggleSubjectStatus(subject)"
              >
                {{ subject.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && filteredSubjects.length === 0" class="text-center py-12 text-gray-500">
        No subjects found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const subjects = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedStatus = ref('');

const filteredSubjects = computed(() => {
  let filtered = subjects.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((s) =>
      s.display_name.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query)
    );
  }

  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active';
    filtered = filtered.filter((s) => s.is_active === isActive);
  }

  return filtered;
});

const loadSubjects = async () => {
  loading.value = true;
  try {
    const response = await $fetch('/api/admin/subjects?includeInactive=true');
    if (response.success) {
      subjects.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load subjects:', error);
  } finally {
    loading.value = false;
  }
};

const toggleSubjectStatus = async (subject) => {
  try {
    await $fetch(`/api/admin/subjects/${subject.name}`, {
      method: 'PUT',
      body: { ...subject, is_active: !subject.is_active }
    });
    await loadSubjects();
  } catch (error) {
    console.error('Failed to toggle subject status:', error);
  }
};

const getStatusBadgeClass = (isActive) => {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
  return isActive ?
    `${baseClass} bg-green-100 text-green-700` :
    `${baseClass} bg-red-100 text-red-700`;
};

onMounted(() => {
  loadSubjects();
});
</script>
