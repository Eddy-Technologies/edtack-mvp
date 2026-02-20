import { ref, computed } from 'vue';

interface QAQuestionSummary {
  id: string;
  title: string;
  chapter_id: string;
  difficulty: string;
  has_diagram: boolean;
  review_status: 'PENDING' | 'APPROVED' | 'FLAGGED';
  question_preview: string;
  has_answer: boolean;
  diagram_crops_count: number;
}

interface QAOption {
  id: string;
  option_text: string;
  image_url: string | null;
}

interface QAAnswer {
  id: string;
  question_id: string;
  option_id: string;
  answer_text: string | null;
  answer_boolean: boolean | null;
  answer_draw_file: string | null;
  order_index: number;
}

interface DiagramCrop {
  placeholder: string;
  storage_path: string;
  public_url: string;
  crop_rect: { x: number; y: number; width: number; height: number };
  page_number: number;
  created_at: string;
}

export interface QAQuestion {
  id: string;
  chapter_id: string;
  difficulty: string;
  parent_question_id: string | null;
  subquestion_order: number | null;
  part_label: string;
  type: string;
  title: string;
  question: string;
  explanation: string | null;
  question_image_url: string | null;
  explanation_image_url: string | null;
  has_diagram: boolean;
  answer: QAAnswer[];
  options: QAOption[];
  source_name: string;
  source_timestamp: string;
  created_at: string;
  updated_at: string;
  review_status: 'PENDING' | 'APPROVED' | 'FLAGGED';
  review_notes: string;
  diagram_crops: DiagramCrop[];
}

interface QAStats {
  total: number;
  pending: number;
  approved: number;
  flagged: number;
  with_diagrams: number;
  needs_crop: number;
}

// Shared state across components (module-level)
const questions = ref<QAQuestionSummary[]>([]);
const currentQuestion = ref<QAQuestion | null>(null);
const currentIndex = ref(0);
const loading = ref(false);
const saving = ref(false);
const isDirty = ref(false);
const stats = ref<QAStats>({
  total: 0,
  pending: 0,
  approved: 0,
  flagged: 0,
  with_diagrams: 0,
  needs_crop: 0,
});
const chapters = ref<string[]>([]);
const totalFiltered = ref(0);

// Filters
const filterChapter = ref('');
const filterStatus = ref('');
const filterHasDiagram = ref(false);
const filterNeedsCrop = ref(false);
const filterSearch = ref('');

export function useQAReview() {
  const progressPercent = computed(() => {
    if (stats.value.total === 0) return 0;
    return Math.round((stats.value.approved / stats.value.total) * 100);
  });

  const currentPageNumber = computed(() => {
    if (!currentQuestion.value) return null;
    const match = currentQuestion.value.title.match(/Page (\d+)/);
    return match ? parseInt(match[1]) : null;
  });

  async function loadQuestions(page = 1) {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      if (filterChapter.value) params.set('chapter', filterChapter.value);
      if (filterStatus.value) params.set('status', filterStatus.value);
      if (filterHasDiagram.value) params.set('hasDiagram', 'true');
      if (filterNeedsCrop.value) params.set('needsCrop', 'true');
      if (filterSearch.value) params.set('search', filterSearch.value);
      params.set('page', String(page));
      params.set('pageSize', '2000'); // Load all for navigation

      const res = await $fetch<{
        success: boolean;
        data: QAQuestionSummary[];
        total: number;
        stats: QAStats;
        chapters: string[];
      }>(`/api/admin/qa/questions?${params.toString()}`);

      if (res.success) {
        questions.value = res.data;
        totalFiltered.value = res.total;
        stats.value = res.stats;
        chapters.value = res.chapters;

        // Auto-select first if no current
        if (questions.value.length > 0 && !currentQuestion.value) {
          await selectQuestion(questions.value[0].id, 0);
        }
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      loading.value = false;
    }
  }

  async function selectQuestion(id: string, index?: number) {
    if (isDirty.value && currentQuestion.value) {
      await saveCurrentQuestion();
    }

    loading.value = true;
    try {
      const res = await $fetch<{ success: boolean; data: QAQuestion }>(
        `/api/admin/qa/questions/${id}`
      );
      if (res.success) {
        currentQuestion.value = res.data;
        if (index !== undefined) {
          currentIndex.value = index;
        } else {
          const idx = questions.value.findIndex((q) => q.id === id);
          if (idx >= 0) currentIndex.value = idx;
        }
        isDirty.value = false;
      }
    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      loading.value = false;
    }
  }

  async function saveCurrentQuestion() {
    if (!currentQuestion.value) return;

    saving.value = true;
    try {
      const res = await $fetch<{ success: boolean; data: QAQuestion }>(
        `/api/admin/qa/questions/${currentQuestion.value.id}`,
        {
          method: 'PUT',
          body: {
            chapter_id: currentQuestion.value.chapter_id,
            difficulty: currentQuestion.value.difficulty,
            question: currentQuestion.value.question,
            explanation: currentQuestion.value.explanation,
            options: currentQuestion.value.options,
            answer: currentQuestion.value.answer,
            review_status: currentQuestion.value.review_status,
            review_notes: currentQuestion.value.review_notes,
            has_diagram: currentQuestion.value.has_diagram,
            question_image_url: currentQuestion.value.question_image_url,
            diagram_crops: currentQuestion.value.diagram_crops,
          },
        }
      );

      if (res.success) {
        currentQuestion.value = res.data;
        isDirty.value = false;

        // Update summary list
        const idx = questions.value.findIndex((q) => q.id === res.data.id);
        if (idx >= 0) {
          questions.value[idx] = {
            ...questions.value[idx],
            review_status: res.data.review_status,
            chapter_id: res.data.chapter_id,
            difficulty: res.data.difficulty,
            has_diagram: res.data.has_diagram,
            diagram_crops_count: res.data.diagram_crops?.length || 0,
          };
        }

        // Refresh stats
        const statsRes = await $fetch<{ success: boolean; stats: QAStats }>(
          '/api/admin/qa/questions?pageSize=0'
        );
        if (statsRes.stats) {
          stats.value = statsRes.stats;
        }
      }
    } catch (err) {
      console.error('Failed to save question:', err);
    } finally {
      saving.value = false;
    }
  }

  async function approveAndNext() {
    if (!currentQuestion.value) return;
    currentQuestion.value.review_status = 'APPROVED';
    isDirty.value = true;
    await saveCurrentQuestion();
    goToNext();
  }

  async function flagQuestion(notes: string) {
    if (!currentQuestion.value) return;
    currentQuestion.value.review_status = 'FLAGGED';
    currentQuestion.value.review_notes = notes;
    isDirty.value = true;
    await saveCurrentQuestion();
  }

  function goToNext() {
    if (currentIndex.value < questions.value.length - 1) {
      const nextIdx = currentIndex.value + 1;
      selectQuestion(questions.value[nextIdx].id, nextIdx);
    }
  }

  function goToPrev() {
    if (currentIndex.value > 0) {
      const prevIdx = currentIndex.value - 1;
      selectQuestion(questions.value[prevIdx].id, prevIdx);
    }
  }

  function markDirty() {
    isDirty.value = true;
  }

  return {
    // State
    questions,
    currentQuestion,
    currentIndex,
    loading,
    saving,
    isDirty,
    stats,
    chapters,
    totalFiltered,

    // Filters
    filterChapter,
    filterStatus,
    filterHasDiagram,
    filterNeedsCrop,
    filterSearch,

    // Computed
    progressPercent,
    currentPageNumber,

    // Actions
    loadQuestions,
    selectQuestion,
    saveCurrentQuestion,
    approveAndNext,
    flagQuestion,
    goToNext,
    goToPrev,
    markDirty,
  };
}
