<template>
  <div class="space-y-6">
    <!-- Header with Add Note Button -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">My Notes</h2>
      <button
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        @click="openCreateModal"
      >
        <UIcon name="i-lucide-plus" size="16" />
        <span>New Note</span>
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
        <div class="flex items-center justify-center w-5 h-5">
          <UIcon name="i-lucide-star" class="text-yellow-500" size="20" />
        </div>
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
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-semibold text-gray-900 text-sm flex-1">{{ note.title }}</h4>
            <div class="relative">
              <button
                class="p-1 text-gray-400 hover:text-gray-600 rounded"
                @click.stop="toggleNoteMenu(note.id)"
              >
                <UIcon name="i-lucide-more-vertical" size="16" />
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="activeNoteMenu === note.id"
                class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-32"
              >
                <button
                  class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  @click.stop="archiveNote(note)"
                >
                  <UIcon name="i-lucide-archive" size="16" />
                  Archive
                </button>
                <button
                  class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  @click.stop="deleteNote(note)"
                >
                  <UIcon name="i-lucide-trash-2" size="16" />
                  Delete
                </button>
              </div>
            </div>
          </div>
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
              <UIcon
                name="i-lucide-star"
                size="20"
                :class="note.isStarred ? 'text-yellow-400 fill-current' : 'text-gray-400 hover:text-yellow-500'"
              />
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
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-semibold text-gray-900 text-sm flex-1">{{ note.title }}</h4>
            <div class="relative">
              <button
                class="p-1 text-gray-400 hover:text-gray-600 rounded"
                @click.stop="toggleNoteMenu(note.id)"
              >
                <UIcon name="i-lucide-more-vertical" size="16" />
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="activeNoteMenu === note.id"
                class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-32"
              >
                <button
                  class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  @click.stop="archiveNote(note)"
                >
                  <UIcon name="i-lucide-archive" size="16" />
                  Archive
                </button>
                <button
                  class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  @click.stop="deleteNote(note)"
                >
                  <UIcon name="i-lucide-trash-2" size="16" />
                  Delete
                </button>
              </div>
            </div>
          </div>
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
              <div v-if="note.isStarred" class="flex items-center justify-center w-5 h-5">
                <UIcon name="i-lucide-star" class="text-yellow-400 fill-current" size="20" />
              </div>
              <div v-else class="flex items-center justify-center w-5 h-5">
                <UIcon name="i-lucide-star" class="text-gray-400 hover:text-yellow-500" size="20" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Archived Notes Section -->
    <div v-if="archivedNotes.length > 0" class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <div class="flex items-center justify-center w-5 h-5 text-gray-500">
          <UIcon name="i-lucide-archive" size="20" />
        </div>
        Archived Notes
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="note in archivedNotes"
          :key="`archived-${note.id}`"
          :style="{ backgroundColor: note.backgroundColor }"
          class="h-64 p-4 rounded-lg border shadow hover:shadow-md transition-shadow cursor-pointer flex flex-col opacity-75"
          @click="openViewModal(note)"
        >
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-semibold text-gray-900 text-sm flex-1">{{ note.title }}</h4>
            <div class="relative">
              <button
                class="p-1 text-gray-400 hover:text-gray-600 rounded"
                @click.stop="toggleNoteMenu(note.id)"
              >
                <div class="flex items-center justify-center w-4 h-4">
                  <UIcon name="i-lucide-more-vertical" size="16" />
                </div>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="activeNoteMenu === note.id"
                class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-32"
              >
                <button
                  class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  @click.stop="unarchiveNote(note)"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-archive-restore" size="16" />
                  </div>
                  Unarchive
                </button>
                <button
                  class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  @click.stop="deleteNote(note)"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-trash-2" size="16" />
                  </div>
                  Delete
                </button>
              </div>
            </div>
          </div>
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
            <span class="text-xs text-gray-500">Archived</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="notes.length === 0" class="text-center py-12">
      <div class="flex items-center justify-center w-12 h-12 mx-auto">
        <UIcon name="i-lucide-file-text" class="text-gray-400" size="48" />
      </div>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
      <p class="mt-1 text-sm text-gray-500">Create your first note to get started organizing your thoughts and study materials.</p>
      <div class="mt-6">
        <p class="text-sm text-gray-400">Use the "New Note" button above to get started.</p>
      </div>
    </div>

    <!-- Note Editor Modal -->
    <NoteEditorModal
      :is-open="showModal"
      :editing-note="editingNote"
      @close="closeModal"
      @save="handleNoteSave"
      @archive="archiveNote"
      @unarchive="unarchiveNote"
      @delete="deleteNote"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import NoteEditorModal from './notes/NoteEditorModal.vue';

interface Note {
  id: number;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  backgroundColor: string;
  isStarred: boolean;
  isArchived: boolean;
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
const activeNoteMenu = ref<number | null>(null);

// Static data
const subjects = ref([
  'Mathematics', 'Science', 'English', 'History', 'Art', 'Music', 'Physical Education', 'Technology'
]);

// Notes data - will be populated from API or sample note
const notes = ref<Note[]>([]);

// Computed properties
const starredNotes = computed(() => {
  return notes.value.filter((note) => note.isStarred && !note.isArchived && matchesFilters(note));
});

const filteredNotes = computed(() => {
  let filtered = notes.value.filter((note) => !note.isStarred && !note.isArchived);

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

const archivedNotes = computed(() => {
  return notes.value.filter((note) => note.isArchived);
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

const handleNoteSave = async (noteData: Partial<Note>) => {
  try {
    if (editingNote.value) {
      // Update existing note
      const response = await $fetch(`/api/notes/${editingNote.value.id}`, {
        method: 'PUT',
        body: {
          title: noteData.title,
          content: noteData.content,
          subject: noteData.subject,
          tags: noteData.tags,
          background_color: noteData.backgroundColor,
          is_pinned: noteData.isStarred, // Database uses is_pinned, frontend uses isStarred
          is_archived: noteData.isArchived || false
        }
      });

      if (response.success) {
        const index = notes.value.findIndex((note) => note.id === editingNote.value!.id);
        if (index !== -1) {
          notes.value[index] = {
            ...editingNote.value,
            ...noteData,
            updatedAt: new Date()
          };
        }
      }
    } else {
      // Create new note
      const response = await $fetch('/api/notes', {
        method: 'POST',
        body: {
          title: noteData.title,
          content: noteData.content,
          subject: noteData.subject,
          tags: noteData.tags,
          background_color: noteData.backgroundColor,
          is_pinned: noteData.isStarred || false, // Database uses is_pinned, frontend uses isStarred
          is_archived: false
        }
      });

      if (response.success && response.data) {
        const newNote: Note = {
          id: response.data.id,
          title: response.data.title,
          content: response.data.content,
          subject: response.data.subject,
          tags: response.data.tags || [],
          backgroundColor: response.data.background_color,
          isStarred: response.data.is_pinned, // Database uses is_pinned, frontend uses isStarred
          isArchived: response.data.is_archived,
          createdAt: new Date(response.data.created_at),
          updatedAt: new Date(response.data.updated_at),
          wordCount: noteData.wordCount || 0
        };
        notes.value.unshift(newNote);
      }
    }
  } catch (error) {
    console.error('Failed to save note:', error);
    // TODO: Show error message to user
    alert('Failed to save note. Please try again.');
  }
};

const toggleNoteMenu = (noteId: number) => {
  activeNoteMenu.value = activeNoteMenu.value === noteId ? null : noteId;
};

const archiveNote = async (note: Note) => {
  try {
    const response = await $fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      body: {
        is_archived: true
      }
    });

    if (response.success) {
      // Update local state only after successful API call
      const index = notes.value.findIndex((n) => n.id === note.id);
      if (index !== -1) {
        notes.value[index].isArchived = true;
        notes.value[index].updatedAt = new Date();
      }
    }
  } catch (error) {
    console.error('Failed to archive note:', error);
    alert('Failed to archive note. Please try again.');
  }
  activeNoteMenu.value = null;
};

const unarchiveNote = async (note: Note) => {
  try {
    const response = await $fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      body: {
        is_archived: false
      }
    });

    if (response.success) {
      // Update local state only after successful API call
      const index = notes.value.findIndex((n) => n.id === note.id);
      if (index !== -1) {
        notes.value[index].isArchived = false;
        notes.value[index].updatedAt = new Date();
      }
    }
  } catch (error) {
    console.error('Failed to unarchive note:', error);
    alert('Failed to unarchive note. Please try again.');
  }
  activeNoteMenu.value = null;
};

const deleteNote = async (note: Note) => {
  if (confirm('Are you sure you want to delete this note?')) {
    try {
      const response = await $fetch(`/api/notes/${note.id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Remove from local state only after successful API call
        const index = notes.value.findIndex((n) => n.id === note.id);
        if (index !== -1) {
          notes.value.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    }
  }
  activeNoteMenu.value = null;
};

const toggleStar = async (note: Note) => {
  try {
    const newStarred = !note.isStarred;
    const response = await $fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      body: {
        is_pinned: newStarred // Note: Database uses is_pinned, frontend uses isStarred
      }
    });

    if (response.success) {
      // Update local state only after successful API call
      const index = notes.value.findIndex((n) => n.id === note.id);
      if (index !== -1) {
        notes.value[index].isStarred = newStarred;
        notes.value[index].updatedAt = new Date();
      }
    }
  } catch (error) {
    console.error('Failed to update star status:', error);
    // Optionally show user feedback
  }
};

const openChatWithNote = (note: Note) => {
  // Navigate to chat with note context
  const chatContext = `Here's my note titled "${note.title}" from ${note.subject}:\n\n${note.content}\n\nPlease help me understand this better or answer any questions I have about this topic.`;

  // For now, we'll just console.log the context - in a real app, this would navigate to chat
  console.log('Chat context:', chatContext);
  alert('Chat integration would open here with the note context');
};

// Create sample note
const createSampleNote = (): Note => ({
  id: 1,
  title: 'Welcome to Notes',
  subject: 'Getting Started',
  content: 'This is an example note to get you started. Click the "New Note" button to create your first note. You can organize notes by subject, add tags, star important notes, and archive completed ones. Use the rich text editor to format your content with headings, lists, and colors.',
  tags: ['example', 'getting-started'],
  backgroundColor: '#fef3c7',
  isStarred: false,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  wordCount: 45
});

// Load notes from API
const loadNotes = async () => {
  try {
    const response = await $fetch('/api/notes');
    if (response.success && response.data && response.data.length > 0) {
      notes.value = response.data.map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        subject: note.subject,
        tags: note.tags || [],
        backgroundColor: note.background_color,
        isStarred: note.is_pinned, // Database uses is_pinned, frontend uses isStarred
        isArchived: note.is_archived,
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
        wordCount: note.word_count || 0
      }));
    } else {
      // No notes found, add sample note
      notes.value = [createSampleNote()];
    }
  } catch (error) {
    console.error('Failed to load notes:', error);
    // API failed, add sample note
    notes.value = [createSampleNote()];
  }
};

// Load notes on component mount
onMounted(() => {
  loadNotes();
});
</script>
