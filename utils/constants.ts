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

// OPERATION_TYPE enum removed - now using database-driven codes table (category='operation_type')
// Access operation types via codeService.getOperationTypeCodes() instead of hardcoded constants

// ORDER_STATUS constants removed - now using database-driven codes table (category='order_status')
// Access statuses via codeService.getOrderStatusCodes() instead of hardcoded constants
