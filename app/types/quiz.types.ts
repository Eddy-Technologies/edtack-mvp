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

export interface BaseQuizQuestion {
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
}

export interface MCQQuestion extends BaseQuizQuestion {
  question_type: 'mcq';
  options: QuizOption[];
}

export interface OpenQuestion extends BaseQuizQuestion {
  question_type: 'open';
  options: [];
}

export interface FillQuestion extends BaseQuizQuestion {
  question_type: 'fill';
  options: [];
}

export interface BooleanQuestion extends BaseQuizQuestion {
  question_type: 'boolean';
  options: [];
}

export interface DrawQuestion extends BaseQuizQuestion {
  question_type: 'draw';
  options: [];
}

export interface HTMLQuestion extends BaseQuizQuestion {
  question_type: 'html';
  options: [];
}

export type QuizQuestion = MCQQuestion | OpenQuestion | FillQuestion | BooleanQuestion | DrawQuestion | HTMLQuestion;

export type UserAnswer = {
  questionId: string;
  answers: string[];
  isCorrect?: boolean;
};

export interface QuizState {
  userAnswers: Record<string, UserAnswer>;
  showExplanations: Record<string, boolean>;
  score: number;
  totalQuestions: number;
}
