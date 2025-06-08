<template>
  <div class="space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">My Notes</h2>
      <div class="flex space-x-3">
        <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg
            class="w-4 h-4 inline mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filter
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <svg
            class="w-4 h-4 inline mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Note
        </button>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search notes..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <select v-model="selectedSubject" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Subjects</option>
          <option v-for="subject in subjects" :key="subject" :value="subject">{{ subject }}</option>
        </select>
        <select v-model="sortBy" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
    </div>

    <!-- Notes Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="note in filteredNotes" :key="note.id" class="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 line-clamp-2">{{ note.title }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ note.subject }}</p>
            </div>
            <div class="flex space-x-1">
              <button class="p-1 text-gray-400 hover:text-gray-600">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
              <button class="p-1 text-gray-400 hover:text-gray-600">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <p class="text-gray-600 text-sm line-clamp-3 mb-4">{{ note.preview }}</p>

          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>{{ note.wordCount }} words</span>
            <span>{{ note.lastModified }}</span>
          </div>

          <div class="flex items-center justify-between mt-4">
            <div class="flex space-x-2">
              <span v-for="tag in note.tags" :key="tag" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {{ tag }}
              </span>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {{ note.views }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredNotes.length === 0" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating your first note.</p>
      <div class="mt-6">
        <button class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Note
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const searchQuery = ref('');
const selectedSubject = ref('');
const sortBy = ref('recent');

const subjects = ref([
  'Mathematics', 'Science', 'English', 'History', 'Art', 'Music', 'Physical Education', 'Technology'
]);

const notes = ref([
  {
    id: 1,
    title: 'Quadratic Equations - Chapter 5',
    subject: 'Mathematics',
    preview: 'Understanding the standard form ax² + bx + c = 0 and how to solve using the quadratic formula. Key concepts include discriminant, vertex form, and graphing parabolas.',
    wordCount: 1250,
    lastModified: '2 hours ago',
    tags: ['algebra', 'equations', 'graphs'],
    views: 23
  },
  {
    id: 2,
    title: 'Photosynthesis Process',
    subject: 'Science',
    preview: 'The process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. Detailed breakdown of light and dark reactions.',
    wordCount: 890,
    lastModified: '1 day ago',
    tags: ['biology', 'plants', 'energy'],
    views: 45
  },
  {
    id: 3,
    title: 'Shakespeare - Romeo and Juliet Analysis',
    subject: 'English',
    preview: 'Character analysis and themes in Romeo and Juliet. Focus on tragedy, family conflict, young love, and fate vs. free will.',
    wordCount: 2100,
    lastModified: '3 days ago',
    tags: ['literature', 'drama', 'analysis'],
    views: 67
  },
  {
    id: 4,
    title: 'World War II Timeline',
    subject: 'History',
    preview: 'Major events from 1939-1945 including key battles, political changes, and the Holocaust. Important dates and figures to remember.',
    wordCount: 1560,
    lastModified: '1 week ago',
    tags: ['wwii', 'timeline', 'events'],
    views: 34
  },
  {
    id: 5,
    title: 'Color Theory Basics',
    subject: 'Art',
    preview: 'Primary, secondary, and tertiary colors. Understanding warm and cool colors, complementary schemes, and how to mix paints effectively.',
    wordCount: 780,
    lastModified: '2 weeks ago',
    tags: ['color', 'theory', 'painting'],
    views: 12
  },
  {
    id: 6,
    title: 'Musical Scales and Modes',
    subject: 'Music',
    preview: 'Major and minor scales, circle of fifths, and different musical modes. Practice exercises for scale recognition and interval training.',
    wordCount: 950,
    lastModified: '1 month ago',
    tags: ['scales', 'theory', 'practice'],
    views: 28
  }
]);

const filteredNotes = computed(() => {
  let filtered = notes.value;

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      note.preview.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Filter by subject
  if (selectedSubject.value) {
    filtered = filtered.filter((note) => note.subject === selectedSubject.value);
  }

  // Sort
  if (sortBy.value === 'alphabetical') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'oldest') {
    filtered.sort((a, b) => a.id - b.id);
  }
  // Default is recent (current order)

  return filtered;
});
</script>
