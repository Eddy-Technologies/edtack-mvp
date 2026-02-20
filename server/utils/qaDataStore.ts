import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Types
export interface QAOption {
  id: string;
  option_text: string;
  image_url: string | null;
}

export interface QAAnswer {
  id: string;
  question_id: string;
  option_id: string;
  answer_text: string | null;
  answer_boolean: boolean | null;
  answer_draw_file: string | null;
  order_index: number;
}

export interface DiagramCrop {
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
  // Review fields
  review_status: 'PENDING' | 'APPROVED' | 'FLAGGED';
  review_notes: string;
  diagram_crops: DiagramCrop[];
}

export interface QAQuestionSummary {
  id: string;
  title: string;
  chapter_id: string;
  difficulty: string;
  has_diagram: boolean;
  review_status: QAQuestion['review_status'];
  question_preview: string;
  has_answer: boolean;
  diagram_crops_count: number;
}

export interface QAStats {
  total: number;
  pending: number;
  approved: number;
  flagged: number;
  with_diagrams: number;
  needs_crop: number;
}

export interface QAListFilters {
  chapter?: string;
  status?: QAQuestion['review_status'];
  hasDiagram?: boolean;
  needsCrop?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

const DATA_PATH = resolve(process.cwd(), 'data/qa/questions.json');
const PAGES_DIR = resolve(process.cwd(), 'data/qa/pages');
const DEBOUNCE_MS = 2000;

class QADataStore {
  private questions: Map<string, QAQuestion> = new Map();
  private orderedIds: string[] = [];
  private loaded = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private dirty = false;

  private ensureLoaded() {
    if (this.loaded) return;

    if (!existsSync(DATA_PATH)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'QA data not found. Run `pnpm qa:prep` first.',
      });
    }

    const raw = readFileSync(DATA_PATH, 'utf-8');
    const arr: QAQuestion[] = JSON.parse(raw);

    this.questions.clear();
    this.orderedIds = [];

    for (const q of arr) {
      this.questions.set(q.id, q);
      this.orderedIds.push(q.id);
    }

    this.loaded = true;
    console.log(`[QADataStore] Loaded ${this.questions.size} questions`);
  }

  getQuestion(id: string): QAQuestion | undefined {
    this.ensureLoaded();
    return this.questions.get(id);
  }

  updateQuestion(id: string, partial: Partial<QAQuestion>): QAQuestion {
    this.ensureLoaded();
    const existing = this.questions.get(id);
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Question not found' });
    }

    const updated = { ...existing, ...partial, updated_at: new Date().toISOString() };
    this.questions.set(id, updated);
    this.scheduleSave();
    return updated;
  }

  listQuestions(filters: QAListFilters = {}): {
    items: QAQuestionSummary[];
    total: number;
    stats: QAStats;
  } {
    this.ensureLoaded();

    const { chapter, status, hasDiagram, needsCrop, search, page = 1, pageSize = 50 } = filters;

    const filtered: QAQuestion[] = [];
    for (const id of this.orderedIds) {
      const q = this.questions.get(id)!;

      if (chapter && q.chapter_id !== chapter) continue;
      if (status && q.review_status !== status) continue;
      if (hasDiagram !== undefined && q.has_diagram !== hasDiagram) continue;
      if (needsCrop && !(q.has_diagram && q.diagram_crops.length === 0)) continue;
      if (search) {
        const s = search.toLowerCase();
        if (
          !q.title.toLowerCase().includes(s) &&
          !q.question.toLowerCase().includes(s) &&
          !q.part_label.toLowerCase().includes(s)
        ) {
          continue;
        }
      }

      filtered.push(q);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    const items: QAQuestionSummary[] = paged.map((q) => ({
      id: q.id,
      title: q.title,
      chapter_id: q.chapter_id,
      difficulty: q.difficulty,
      has_diagram: q.has_diagram,
      review_status: q.review_status,
      question_preview: q.question.slice(0, 120),
      has_answer: q.answer.length > 0,
      diagram_crops_count: q.diagram_crops?.length || 0,
    }));

    return { items, total, stats: this.getStats() };
  }

  getStats(): QAStats {
    this.ensureLoaded();

    let pending = 0,
      approved = 0,
      flagged = 0,
      with_diagrams = 0,
      needs_crop = 0;

    for (const q of this.questions.values()) {
      if (q.review_status === 'PENDING') pending++;
      else if (q.review_status === 'APPROVED') approved++;
      else if (q.review_status === 'FLAGGED') flagged++;
      if (q.has_diagram) {
        with_diagrams++;
        if (!q.diagram_crops || q.diagram_crops.length === 0) needs_crop++;
      }
    }

    return {
      total: this.questions.size,
      pending,
      approved,
      flagged,
      with_diagrams,
      needs_crop,
    };
  }

  getAllCrops(): DiagramCrop[] {
    this.ensureLoaded();
    const seen = new Set<string>();
    const crops: DiagramCrop[] = [];
    for (const q of this.questions.values()) {
      for (const c of q.diagram_crops || []) {
        if (!seen.has(c.public_url)) {
          seen.add(c.public_url);
          crops.push(c);
        }
      }
    }
    // Sort newest first, return last 5
    crops.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return crops.slice(0, 5);
  }

  getPageImagePath(pageNum: number): string {
    const filename = `page_${String(pageNum).padStart(3, '0')}.jpg`;
    const fullPath = resolve(PAGES_DIR, filename);
    if (!existsSync(fullPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: `Page image not found: ${filename}`,
      });
    }
    return fullPath;
  }

  getAllChapters(): string[] {
    this.ensureLoaded();
    const chapters = new Set<string>();
    for (const q of this.questions.values()) {
      chapters.add(q.chapter_id);
    }
    return [...chapters].sort();
  }

  private scheduleSave() {
    this.dirty = true;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveToDisk(), DEBOUNCE_MS);
  }

  private saveToDisk() {
    if (!this.dirty) return;

    const arr: QAQuestion[] = [];
    for (const id of this.orderedIds) {
      const q = this.questions.get(id);
      if (q) arr.push(q);
    }

    writeFileSync(DATA_PATH, JSON.stringify(arr, null, 2));
    this.dirty = false;
    console.log(`[QADataStore] Saved ${arr.length} questions to disk`);
  }
}

// Singleton
export const qaDataStore = new QADataStore();
