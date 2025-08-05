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

export enum TASK_STATUS {
  PENDING = 'TASK_PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'TASK_CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum TASK_PRIORITY {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// Export all enum types for convenience
export type OrderStatus = keyof typeof ORDER_STATUS;
export type OperationType = keyof typeof OPERATION_TYPE;
export type TaskStatus = keyof typeof TASK_STATUS;
export type TaskPriority = keyof typeof TASK_PRIORITY;
