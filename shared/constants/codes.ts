// System Code Constants - TypeScript Enums
// These enums match the database codes table values

export enum ORDER_STATUS {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PENDING_PARENT_APPROVAL = 'PENDING_PARENT_APPROVAL',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PARENT_APPROVED = 'PARENT_APPROVED',
  REJECTED = 'REJECTED'
}

export enum OPERATION_TYPE {
  CREDIT_TOPUP = 'CREDIT_TOPUP',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  BALANCE_ADJUSTMENT = 'BALANCE_ADJUSTMENT',
  PURCHASE = 'PURCHASE'
}

// Task statuses for user_tasks (task assignments)
export enum TASK_STATUS {
  OPEN = 'OPEN', // Task is active and assigned
  CLOSED = 'CLOSED', // Task has been manually closed/disabled
  EXPIRED = 'EXPIRED' // Task has reached its end date or been automatically expired
}

export enum ORDER_FULFILLMENT {
  PENDING_FULFILLMENT = 'PENDING_FULFILLMENT',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum LESSON_GENERATION_TYPE {
  QUIZ = 'QUIZ',
  LESSON = 'LESSON'
}

// Marking status for question attempts (AI/manual marking results)
export enum MARKING_STATUS {
  CORRECT = 'CORRECT',
  PARTIALLY_CORRECT = 'PARTIALLY_CORRECT',
  INCORRECT = 'INCORRECT'
}

// Question types
export enum QUESTION_TYPE {
  PARENT = 'PARENT',
  MCQ = 'MCQ',
  OPEN = 'OPEN',
  BOOLEAN = 'BOOLEAN',
  DRAW = 'DRAW',
  FILL = 'FILL'
}

// Group member status (for group_members table)
export enum GROUP_MEMBER_STATUS {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING'
}

// Group type (for groups table)
export enum GROUP_TYPE {
  FAMILY = 'FAMILY'
}

// User roles (matches roles table)
export enum USER_ROLE {
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

// Message status (for chat system)
export enum MESSAGE_STATUS {
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  STREAMING = 'STREAMING',
  USER_MESSAGE = 'USER_MESSAGE',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// Entity status (for products, characters, subjects)
export enum ENTITY_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Transfer type (for credit_transactions)
export enum TRANSFER_TYPE {
  QUIZ_REWARD = 'QUIZ_REWARD',
  PARENT_TO_CHILD = 'PARENT_TO_CHILD',
  INTERNAL_PLEDGE = 'INTERNAL_PLEDGE'
}

// Feedback type (for message_feedback table)
export enum FEEDBACK_TYPE {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE'
}

// Stripe checkout mode
export enum STRIPE_MODE {
  PAYMENT = 'PAYMENT',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

// Study type (for study actions in frontend)
export enum STUDY_TYPE {
  LESSON = 'LESSON',
  PRACTICE = 'PRACTICE',
  QUIZ = 'QUIZ'
}

// Generation intent type (for AI response types)
export enum GENERATION_INTENT_TYPE {
  STANDARD_RESPONSE = 'STANDARD_RESPONSE',
  LESSON = 'LESSON',
  QUIZ = 'QUIZ'
}

// Export all enum types for convenience
export type OrderStatus = keyof typeof ORDER_STATUS;
export type OperationType = keyof typeof OPERATION_TYPE;
export type TaskStatus = keyof typeof TASK_STATUS;
export type OrderFulfillment = keyof typeof ORDER_FULFILLMENT;
export type LessonGenerationType = keyof typeof LESSON_GENERATION_TYPE;
export type MarkingStatus = keyof typeof MARKING_STATUS;
export type QuestionType = keyof typeof QUESTION_TYPE;
export type GroupMemberStatus = keyof typeof GROUP_MEMBER_STATUS;
export type GroupType = keyof typeof GROUP_TYPE;
export type UserRole = keyof typeof USER_ROLE;
export type MessageStatusType = keyof typeof MESSAGE_STATUS;
export type EntityStatus = keyof typeof ENTITY_STATUS;
export type TransferType = keyof typeof TRANSFER_TYPE;
export type FeedbackType = keyof typeof FEEDBACK_TYPE;
export type StripeMode = keyof typeof STRIPE_MODE;
export type StudyType = keyof typeof STUDY_TYPE;
export type GenerationIntentType = keyof typeof GENERATION_INTENT_TYPE;
