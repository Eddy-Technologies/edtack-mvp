<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    @click.self="handleClose"
  >
    <div class="max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Note-like Container with Dynamic Background -->
      <div
        :style="{ backgroundColor: noteForm.backgroundColor }"
        class="rounded-xl shadow-xl flex flex-col max-h-[90vh] transition-all duration-200"
      >
        <!-- Header with Menu and Close Button -->
        <div class="flex justify-between items-center p-4 flex-shrink-0">
          <div v-if="editingNote" class="relative">
            <button
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/30 rounded-lg transition-colors"
              title="Note Options"
              @click="showNoteMenu = !showNoteMenu"
            >
              <div class="flex items-center justify-center w-5 h-5">
                <UIcon name="i-lucide-more-vertical" size="20" />
              </div>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showNoteMenu"
              class="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-32"
            >
              <button
                v-if="!editingNote.isArchived"
                class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                @click="archiveCurrentNote"
              >
                <div class="flex items-center justify-center w-4 h-4">
                  <UIcon name="i-lucide-archive" size="16" />
                </div>
                Archive
              </button>
              <button
                v-else
                class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                @click="unarchiveCurrentNote"
              >
                <div class="flex items-center justify-center w-4 h-4">
                  <UIcon name="i-lucide-archive-restore" size="16" />
                </div>
                Unarchive
              </button>
              <button
                class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                @click="deleteCurrentNote"
              >
                <div class="flex items-center justify-center w-4 h-4">
                  <UIcon name="i-lucide-trash-2" size="16" />
                </div>
                Delete
              </button>
            </div>
          </div>

          <button
            class="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/30 rounded-lg transition-colors"
            title="Close"
            @click="handleClose"
          >
            <div class="flex items-center justify-center w-5 h-5">
              <UIcon name="i-lucide-x" size="20" />
            </div>
          </button>
        </div>

        <!-- Title Input -->
        <div class="px-8 mb-6 flex-shrink-0">
          <input
            ref="titleInput"
            v-model="noteForm.title"
            type="text"
            placeholder="Note Title..."
            class="w-full text-3xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-500 resize-none"
            style="font-family: 'Inter', sans-serif;"
          >
        </div>

        <!-- Scrollable Content Area -->
        <div class="px-8 flex-1 overflow-y-auto scrollbar-hide">
          <div
            ref="contentEditable"
            contenteditable="true"
            class="w-full min-h-[300px] text-lg text-gray-800 bg-transparent border-none outline-none resize-none leading-7 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500"
            style="font-family: 'Inter', sans-serif; line-height: 2rem; white-space: pre-wrap;"
            data-placeholder="Start writing your note..."
            @input="updateContent"
            @focus="contentFocused = true"
            @blur="contentFocused = false"
            @keydown="handleKeydown"
          />
        </div>

        <!-- Text Formatting Tools -->
        <div class="border-t border-gray-900/20 bg-white/30 backdrop-blur-sm flex-shrink-0">
          <div class="px-8 py-4">
            <div class="flex flex-wrap items-center gap-3">
              <!-- Text Style -->
              <div class="flex items-center gap-1">
                <button
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    isBold ? 'bg-gray-800 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  ]"
                  title="Bold"
                  @click="toggleBold"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-bold" size="16" />
                  </div>
                </button>
                <button
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    isItalic ? 'bg-gray-800 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  ]"
                  title="Italic"
                  @click="toggleItalic"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-italic" size="16" />
                  </div>
                </button>
                <button
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    isUnderline ? 'bg-gray-800 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  ]"
                  title="Underline"
                  @click="toggleUnderline"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-underline" size="16" />
                  </div>
                </button>
              </div>

              <!-- Divider -->
              <div class="h-6 w-px bg-gray-300" />

              <!-- Text Alignment -->
              <div class="flex items-center gap-1">
                <button
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    textAlign === 'left' ? 'bg-gray-800 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  ]"
                  title="Align Left"
                  @click="setTextAlign('left')"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-align-left" size="16" />
                  </div>
                </button>
                <button
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    textAlign === 'center' ? 'bg-gray-800 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  ]"
                  title="Align Center"
                  @click="setTextAlign('center')"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-align-center" size="16" />
                  </div>
                </button>
                <button
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    textAlign === 'right' ? 'bg-gray-800 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  ]"
                  title="Align Right"
                  @click="setTextAlign('right')"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-align-right" size="16" />
                  </div>
                </button>
                <button
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    textAlign === 'justify' ? 'bg-gray-800 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  ]"
                  title="Justify"
                  @click="setTextAlign('justify')"
                >
                  <div class="flex items-center justify-center w-4 h-4">
                    <UIcon name="i-lucide-align-justify" size="16" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Controls Section -->
        <div class="bg-white/50 backdrop-blur-sm rounded-b-xl p-6 border-t border-gray-200/50 flex-shrink-0">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Subject Dropdown -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                v-model="noteForm.subject"
                class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="">Select subject</option>
                <option v-for="subject in subjects" :key="subject" :value="subject">
                  {{ subject }}
                </option>
              </select>
            </div>

            <!-- Tags Dropdown/Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div class="relative">
                <input
                  v-model="newTag"
                  type="text"
                  placeholder="Add tags..."
                  class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  @keydown.enter.prevent="addTag"
                  @keydown="handleTagKeydown"
                >
                <div v-if="noteForm.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="(tag, index) in noteForm.tags"
                    :key="index"
                    class="inline-flex items-center px-2 py-1 bg-white text-black text-sm rounded-full border border-black"
                  >
                    {{ tag }}
                    <button
                      class="ml-1 text-gray-500 hover:text-gray-700"
                      @click="removeTag(index)"
                    >
                      <div class="flex items-center justify-center w-3 h-3">
                        <UIcon name="i-lucide-x" size="12" />
                      </div>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <!-- Background Color Selector -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note Color</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in backgroundColors"
                  :key="color.value"
                  :class="[
                    'w-8 h-8 rounded-full border-2 transition-all',
                    noteForm.backgroundColor === color.value
                      ? 'border-gray-600 scale-110 shadow-lg'
                      : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                  ]"
                  :style="{ backgroundColor: color.value }"
                  :title="color.name"
                  @click="noteForm.backgroundColor = color.value"
                />
              </div>
            </div>
          </div>

          <!-- Star Option -->
          <div class="flex items-center justify-between">
            <button
              class="flex items-center gap-2"
              @click="noteForm.isStarred = !noteForm.isStarred"
            >
              <div class="flex items-center justify-center w-5 h-5">
                <UIcon
                  name="i-lucide-star"
                  :class="noteForm.isStarred ? 'text-yellow-400 fill-current' : 'text-gray-400'"
                  size="20"
                />
              </div>
            </button>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                @click="saveNote"
              >
                {{ editingNote ? 'Update Note' : 'Save Note' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Discard Changes Modal -->
    <div
      v-if="showDiscardModal"
      class="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="showDiscardModal = false"
    >
      <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Discard Changes?</h3>
          <button
            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            @click="showDiscardModal = false"
          >
            <div class="flex items-center justify-center w-5 h-5">
              <UIcon name="i-lucide-x" size="20" />
            </div>
          </button>
        </div>
        <p class="text-gray-600 mb-6">You have unsaved changes. Do you want to save them before closing?</p>
        <div class="flex gap-3 justify-end">
          <button
            class="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            @click="discardChanges"
          >
            Discard
          </button>
          <button
            class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            @click="saveAndClose"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

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

interface Props {
  isOpen: boolean;
  editingNote?: Note | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [note: Partial<Note>];
  archive: [note: Note];
  unarchive: [note: Note];
  delete: [note: Note];
}>();

// Reactive state
const titleInput = ref<HTMLInputElement>();
const contentEditable = ref<HTMLDivElement>();
const contentFocused = ref(false);
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);
const textAlign = ref('left');
const newTag = ref('');
const showDiscardModal = ref(false);
const hasUnsavedChanges = ref(false);
const originalFormData = ref<any>(null);
const showNoteMenu = ref(false);

// Form data
const noteForm = ref({
  title: '',
  subject: '',
  content: '',
  tags: [] as string[],
  backgroundColor: '#ffffff',
  isStarred: false
});

// Static data
const subjects = ref([
  'Mathematics', 'Science', 'English', 'History', 'Art', 'Music', 'Physical Education', 'Technology'
]);

const backgroundColors = ref([
  { name: 'White', value: '#ffffff' },
  { name: 'Light Yellow', value: '#fef3c7' },
  { name: 'Light Green', value: '#d1fae5' },
  { name: 'Light Blue', value: '#dbeafe' },
  { name: 'Light Pink', value: '#fce7f3' },
  { name: 'Light Purple', value: '#e9d5ff' },
  { name: 'Light Orange', value: '#fed7aa' },
  { name: 'Light Gray', value: '#f3f4f6' }
]);

// Watch for editing note changes
watch(() => props.editingNote, (note) => {
  if (note) {
    noteForm.value = {
      title: note.title,
      subject: note.subject,
      content: note.content,
      tags: [...note.tags],
      backgroundColor: note.backgroundColor,
      isStarred: note.isStarred
    };
    // Set content in the editable div
    nextTick(() => {
      if (contentEditable.value) {
        contentEditable.value.innerHTML = note.content;
      }
    });
  } else {
    // Reset form for new note
    noteForm.value = {
      title: '',
      subject: '',
      content: '',
      tags: [],
      backgroundColor: '#ffffff',
      isStarred: false
    };
    nextTick(() => {
      if (contentEditable.value) {
        contentEditable.value.innerHTML = '';
      }
    });
  }

  // Store original data for comparison
  originalFormData.value = JSON.stringify(noteForm.value);
  hasUnsavedChanges.value = false;
}, { immediate: true });

// Watch for modal open to focus title
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    titleInput.value?.focus();
  }
});

// Methods
const updateContent = () => {
  if (contentEditable.value) {
    noteForm.value.content = contentEditable.value.innerHTML;
    checkForChanges();
  }
};

const toggleBold = () => {
  document.execCommand('bold');
  if (contentEditable.value) {
    contentEditable.value.focus();
    updateContent();
  }
};

const toggleItalic = () => {
  document.execCommand('italic');
  if (contentEditable.value) {
    contentEditable.value.focus();
    updateContent();
  }
};

const toggleUnderline = () => {
  document.execCommand('underline');
  if (contentEditable.value) {
    contentEditable.value.focus();
    updateContent();
  }
};

const setTextAlign = (alignment: string) => {
  textAlign.value = alignment;
  document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1));
  if (contentEditable.value) {
    contentEditable.value.focus();
    updateContent();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Allow default behavior for line breaks
    // The contenteditable will handle this naturally with white-space: pre-wrap
  }
};

const checkForChanges = () => {
  const currentData = JSON.stringify(noteForm.value);
  hasUnsavedChanges.value = currentData !== originalFormData.value;
};

const handleTagKeydown = (event: KeyboardEvent) => {
  if (event.key === ',' || event.key === 'Enter') {
    event.preventDefault();
    addTag();
  }
};

const addTag = () => {
  const tag = newTag.value.trim().replace(',', '');
  if (tag && !noteForm.value.tags.includes(tag)) {
    noteForm.value.tags.push(tag);
    newTag.value = '';
    checkForChanges();
  }
};

const removeTag = (index: number) => {
  noteForm.value.tags.splice(index, 1);
  checkForChanges();
};

const handleClose = () => {
  if (hasUnsavedChanges.value) {
    showDiscardModal.value = true;
  } else {
    emit('close');
  }
};

const discardChanges = () => {
  showDiscardModal.value = false;
  emit('close');
};

const saveAndClose = () => {
  saveNote();
  showDiscardModal.value = false;
};

const saveNote = () => {
  if (!noteForm.value.title.trim() || !noteForm.value.content.trim()) {
    alert('Please fill in both title and content');
    return;
  }

  // Get plain text content for word count
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = noteForm.value.content;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;

  const noteData = {
    ...noteForm.value,
    content: noteForm.value.content, // Keep HTML formatting
    wordCount,
    updatedAt: new Date()
  };

  if (!props.editingNote) {
    (noteData as any).createdAt = new Date();
  }

  emit('save', noteData);
  emit('close');
};

const archiveCurrentNote = () => {
  if (props.editingNote) {
    emit('archive', props.editingNote);
    showNoteMenu.value = false;
    emit('close');
  }
};

const unarchiveCurrentNote = () => {
  if (props.editingNote) {
    emit('unarchive', props.editingNote);
    showNoteMenu.value = false;
    emit('close');
  }
};

const deleteCurrentNote = () => {
  if (props.editingNote && confirm('Are you sure you want to delete this note?')) {
    emit('delete', props.editingNote);
    showNoteMenu.value = false;
    emit('close');
  }
};
</script>

<style scoped>
/* Custom scrollbar for content area */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* Hide browser default textarea resize handle */
textarea {
  resize: none;
}

/* Focus states for better UX */
input:focus, textarea:focus, select:focus {
  outline: none;
}

/* Hide scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
