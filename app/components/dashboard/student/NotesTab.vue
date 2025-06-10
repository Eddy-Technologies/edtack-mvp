<template>
  <div class="space-y-6">
    <!-- Header with Add Note Button -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">My Notes</h2>
      <button
        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        @click="openCreateModal"
      >
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        New Note
      </button>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search notes..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
        </div>
        <select v-model="selectedSubject" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Subjects</option>
          <option v-for="subject in subjects" :key="subject" :value="subject">{{ subject }}</option>
        </select>
        <select v-model="sortBy" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
    </div>

    <!-- Starred Notes Section -->
    <div v-if="starredNotes.length > 0" class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        Starred Notes
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="note in starredNotes"
          :key="`starred-${note.id}`"
          :style="{ backgroundColor: note.backgroundColor }"
          class="h-64 p-4 rounded-lg border shadow hover:shadow-md transition-shadow cursor-pointer flex flex-col"
          @click="openViewModal(note)"
        >
          <h4 class="font-semibold text-gray-900 mb-2 text-sm">{{ note.title }}</h4>
          <p class="text-xs text-gray-600 mb-2">{{ note.subject }}</p>
          <div class="text-xs text-gray-700 mb-3 whitespace-pre-wrap flex-1 overflow-hidden" v-html="note.content" />
          <div class="flex items-center justify-between mt-auto">
            <div class="flex gap-1 flex-wrap">
              <span
                v-for="tag in note.tags.slice(0, 2)"
                :key="tag"
                class="px-2 py-1 bg-white text-black text-xs rounded-full border border-black"
              >
                {{ tag }}
              </span>
            </div>
            <button
              class="flex-shrink-0"
              @click.stop="toggleStar(note)"
            >
              <svg class="w-5 h-5" fill="#fbbf24" viewBox="0 0 24 24">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Regular Notes Section -->
    <div class="space-y-4">
      <h3 v-if="starredNotes.length > 0" class="text-lg font-semibold text-gray-900">All Notes</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          :style="{ backgroundColor: note.backgroundColor }"
          class="h-64 p-4 rounded-lg border shadow hover:shadow-md transition-shadow cursor-pointer flex flex-col"
          @click="openViewModal(note)"
        >
          <h4 class="font-semibold text-gray-900 mb-2 text-sm">{{ note.title }}</h4>
          <p class="text-xs text-gray-600 mb-2">{{ note.subject }}</p>
          <div class="text-xs text-gray-700 mb-3 whitespace-pre-wrap flex-1 overflow-hidden" v-html="note.content" />
          <div class="flex items-center justify-between mt-auto">
            <div class="flex gap-1 flex-wrap">
              <span
                v-for="tag in note.tags.slice(0, 2)"
                :key="tag"
                class="px-2 py-1 bg-white text-black text-xs rounded-full border border-black"
              >
                {{ tag }}
              </span>
            </div>
            <button
              class="flex-shrink-0"
              @click.stop="toggleStar(note)"
            >
              <span
                v-if="note.isStarred"
                class="text-lg"
                style="color: #fbbf24; text-shadow: 0 0 1px #000;"
              >⭐</span>
              <span
                v-else
                class="text-lg text-gray-400 hover:text-yellow-500"
              >☆</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="notes.length === 0" class="text-center py-12">
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
      <p class="mt-1 text-sm text-gray-500">Create your first note to get started organizing your thoughts and study materials.</p>
      <div class="mt-6">
        <button
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          @click="openCreateModal"
        >
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

    <!-- Note Editor Modal -->
    <NoteEditorModal
      :is-open="showModal"
      :editing-note="editingNote"
      @close="closeModal"
      @save="handleNoteSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NoteEditorModal from './NoteEditorModal.vue';

interface Note {
  id: number;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  backgroundColor: string;
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
}

// Reactive data
const searchQuery = ref('');
const selectedSubject = ref('');
const sortBy = ref('recent');
const showModal = ref(false);
const editingNote = ref<Note | null>(null);

// Static data
const subjects = ref([
  'Mathematics', 'Science', 'English', 'History', 'Art', 'Music', 'Physical Education', 'Technology'
]);

// Sample notes data
const notes = ref<Note[]>([
  {
    id: 1,
    title: 'Quadratic Equations - Chapter 5',
    subject: 'Mathematics',
    content: 'Understanding the standard form ax² + bx + c = 0 and how to solve using the quadratic formula. Key concepts include discriminant, vertex form, and graphing parabolas. The discriminant helps determine the nature of roots. When b² - 4ac > 0, we have two real roots. When b² - 4ac = 0, we have one repeated root. When b² - 4ac < 0, we have complex roots. The vertex form is y = a(x - h)² + k where (h, k) is the vertex.',
    tags: ['algebra', 'equations', 'graphs'],
    backgroundColor: '#fef3c7',
    isStarred: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    wordCount: 1250
  },
  {
    id: 2,
    title: 'Photosynthesis Process',
    subject: 'Science',
    content: 'The process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. Detailed breakdown of light and dark reactions. Light reactions occur in the thylakoids where chlorophyll absorbs light energy. The Calvin cycle happens in the stroma where CO2 is fixed into glucose. Overall equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. This process is crucial for all life on Earth as it produces oxygen and organic compounds.',
    tags: ['biology', 'plants', 'energy'],
    backgroundColor: '#d1fae5',
    isStarred: false,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    wordCount: 890
  },
  {
    id: 3,
    title: 'Shakespeare - Romeo and Juliet Analysis',
    subject: 'English',
    content: 'Character analysis and themes in Romeo and Juliet. Focus on tragedy, family conflict, young love, and fate vs. free will. The play explores the destructive nature of feuds between the Montagues and Capulets. Romeo and Juliet\'s love is portrayed as pure but doomed by circumstance. Key themes include the power of love, the inevitability of fate, and the consequences of hatred. Important quotes to remember for analysis.',
    tags: ['literature', 'drama', 'analysis'],
    backgroundColor: '#fce7f3',
    isStarred: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    wordCount: 2100
  },
  {
    id: 4,
    title: 'World War II Timeline',
    subject: 'History',
    content: 'Major events from 1939-1945 including key battles, political changes, and the Holocaust. September 1939: Germany invades Poland, Britain and France declare war. June 1940: Fall of France. December 1941: Pearl Harbor attack, US enters war. June 1942: Battle of Midway. February 1943: Battle of Stalingrad ends. June 1944: D-Day landings in Normandy. May 1945: Germany surrenders. August 1945: Atomic bombs dropped on Japan, Japan surrenders.',
    tags: ['wwii', 'timeline', 'events', 'history'],
    backgroundColor: '#e9d5ff',
    isStarred: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    wordCount: 1560
  },
  {
    id: 5,
    title: 'Cellular Respiration Notes',
    subject: 'Science',
    content: 'The process of breaking down glucose to produce ATP energy. Three main stages: Glycolysis (in cytoplasm), Krebs cycle (in mitochondria matrix), and Electron transport chain (in inner mitochondrial membrane). Glycolysis produces 2 ATP, Krebs cycle produces 2 ATP, ETC produces about 32 ATP. Total: approximately 36-38 ATP molecules per glucose. Requires oxygen for complete process (aerobic respiration).',
    tags: ['biology', 'cellular', 'energy', 'ATP'],
    backgroundColor: '#dbeafe',
    isStarred: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    wordCount: 645
  },
  {
    id: 6,
    title: 'Pythagorean Theorem Applications',
    subject: 'Mathematics',
    content: 'a² + b² = c² where c is the hypotenuse of a right triangle. Used in coordinate geometry to find distances between points. Also useful in real-world problems like finding ladder heights, diagonal measurements, and navigation. Example: To find the distance between points (3,4) and (0,0), use √(3² + 4²) = √25 = 5. Practice problems include construction, engineering, and physics applications.',
    tags: ['geometry', 'triangles', 'distance', 'applications'],
    backgroundColor: '#fed7aa',
    isStarred: false,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
    wordCount: 432
  },
  {
    id: 7,
    title: 'Essay Writing Structure',
    subject: 'English',
    content: 'Five-paragraph essay format: Introduction with thesis statement, three body paragraphs with topic sentences and supporting evidence, conclusion that restates thesis and summarizes main points. Each body paragraph should have: topic sentence, evidence/examples, analysis/explanation, transition to next paragraph. Use strong transitions like "furthermore," "however," "in contrast," "consequently." Always cite sources properly and maintain formal academic tone.',
    tags: ['writing', 'essays', 'structure', 'academic'],
    backgroundColor: '#f3f4f6',
    isStarred: false,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    wordCount: 789
  },
  {
    id: 8,
    title: 'Chemical Bonding Types',
    subject: 'Science',
    content: 'Three main types of chemical bonds: Ionic bonds (transfer of electrons between metal and nonmetal), Covalent bonds (sharing of electrons between nonmetals), Metallic bonds (sea of electrons in metals). Ionic compounds have high melting points and conduct electricity when dissolved. Covalent compounds can be gases, liquids, or solids at room temperature. Polar vs nonpolar covalent bonds depend on electronegativity differences.',
    tags: ['chemistry', 'bonds', 'ionic', 'covalent'],
    backgroundColor: '#dbeafe',
    isStarred: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    wordCount: 523
  }
]);

// Computed properties
const starredNotes = computed(() => {
  return notes.value.filter((note) => note.isStarred && matchesFilters(note));
});

const filteredNotes = computed(() => {
  let filtered = notes.value.filter((note) => !note.isStarred);

  // Apply filters
  filtered = filtered.filter(matchesFilters);

  // Sort
  if (sortBy.value === 'alphabetical') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'oldest') {
    filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else {
    filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  return filtered;
});

// Helper function for filtering
const matchesFilters = (note: Note) => {
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    const matchesSearch = note.title.toLowerCase().includes(query) ||
      note.subject.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some((tag) => tag.toLowerCase().includes(query));

    if (!matchesSearch) return false;
  }

  // Filter by subject
  if (selectedSubject.value && note.subject !== selectedSubject.value) {
    return false;
  }

  return true;
};

// Methods
const openCreateModal = () => {
  editingNote.value = null;
  showModal.value = true;
};

const openViewModal = (note: Note) => {
  // For now, just open the edit modal
  openEditModal(note);
};

const openEditModal = (note: Note) => {
  editingNote.value = note;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingNote.value = null;
};

const handleNoteSave = (noteData: Partial<Note>) => {
  if (editingNote.value) {
    // Update existing note
    const index = notes.value.findIndex((note) => note.id === editingNote.value!.id);
    if (index !== -1) {
      notes.value[index] = {
        ...editingNote.value,
        ...noteData,
        updatedAt: new Date()
      };
    }
  } else {
    // Create new note
    const newNote: Note = {
      id: Math.max(...notes.value.map((n) => n.id), 0) + 1,
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Note;
    notes.value.unshift(newNote);
  }
};

const deleteNote = (note: Note) => {
  if (confirm('Are you sure you want to delete this note?')) {
    const index = notes.value.findIndex((n) => n.id === note.id);
    if (index !== -1) {
      notes.value.splice(index, 1);
    }
  }
};

const toggleStar = (note: Note) => {
  const index = notes.value.findIndex((n) => n.id === note.id);
  if (index !== -1) {
    notes.value[index].isStarred = !notes.value[index].isStarred;
    notes.value[index].updatedAt = new Date();
  }
};

const openChatWithNote = (note: Note) => {
  // Navigate to chat with note context
  const chatContext = `Here's my note titled "${note.title}" from ${note.subject}:\n\n${note.content}\n\nPlease help me understand this better or answer any questions I have about this topic.`;

  // For now, we'll just console.log the context - in a real app, this would navigate to chat
  console.log('Chat context:', chatContext);
  alert('Chat integration would open here with the note context');
};
</script>
