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
  LESSON = 'LESSON'
}

// Export all enum types for convenience
export type OrderStatus = keyof typeof ORDER_STATUS;
export type OperationType = keyof typeof OPERATION_TYPE;
export type TaskStatus = keyof typeof TASK_STATUS;
export type OrderFulfillment = keyof typeof ORDER_FULFILLMENT;
export type LessonGenerationType = keyof typeof LESSON_GENERATION_TYPE;
