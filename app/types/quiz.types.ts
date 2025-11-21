import type { QUESTION_TYPE } from '~~/shared/constants';

export interface QuizOption {
  id: string;
  option_text: string | null;
  imageUrl: string | null;
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  option_id: string | null;
  answer_text: string | null;
  answer_boolean: boolean | null;
  answer_draw_file: string | null;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  syllabus_id: string;
  parent_id: string | null;
  order: number | null;
  part_label: string | null;
  type: 'question';
  title: string;
  content: string;
  speech_to_text_content: string;
  answer: QuizAnswer[];
  explanation: string | null;
  created_at: string;
  updated_at: string;
  source_timestamp: string;
  notes_url: string | null;
  question_type: QUESTION_TYPE;
  options?: QuizOption[];
}

export type UserAnswer = {
  questionId: string;
  answers: string[];
  isCorrect?: boolean;
};
