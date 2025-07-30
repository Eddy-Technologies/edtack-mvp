export const STRIPE_CUSTOMER = {
  NOT_EXISTENT: 'CUSTOMER_NOT_EXIST',
  NO_ACTIVE_SUBSCRIPTION: 'CUSTOMER_HAS_NO_ACTIVE_SUBSCRIPTION',
  WITH_ACTIVE_SUBSCRIPTION: 'CUSTOMER_WITH_ACTIVE_SUBSCRIPTION'
};

export const STRIPE_LOOKUP_KEYS = {
  EDDY_FREE_MONTHLY: 'EDDY_FREE_MONTHLY',
  EDDY_FREE_YEARLY: 'EDDY_FREE_YEARLY',
  EDDY_PRO_MONTHLY: 'EDDY_PRO_MONTHLY',
  EDDY_PRO_YEARLY: 'EDDY_PRO_YEARLY',
  EDDY_MAX_MONTHLY: 'EDDY_MAX_MONTHLY',
  EDDY_MAX_YEARLY: 'EDDY_MAX_YEARLY',
};

export enum OPERATION_TYPE {
  CREDIT_TOPUP = 'credit_topup',
  TRANSFER_OUT = 'transfer_out',
  TRANSFER_IN = 'transfer_in',
  BALANCE_ADJUSTMENT = 'balance_adjustment',
}

export const ORDER_STATUS = {
  // Standard order statuses
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',

  // Product-specific statuses
  RETURNED: 'returned',
  FAILED_TO_DELIVER: 'failed_to_deliver',

  // Payment change statuses
  REFUND_REQUESTED: 'refund_requested',
  REFUND_IN_PROGRESS: 'refund_in_progress',
  REFUNDED: 'refunded',

  CANCEL_REQUESTED: 'cancel_requested',
  CANCEL_IN_PROGRESS: 'cancel_in_progress',
  CANCELLED: 'cancelled',
};
