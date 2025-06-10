// Common/Shared Models for API GET Requests
export interface UserInfoRes {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email?: string;
  date_of_birth: string;
  profile_picture_url?: string;

  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_postal?: string;
  address_country?: string;

  onboarded?: boolean;
  is_active?: boolean;
  app_user_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserBillingHistoryRes {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: string;
  invoice_url?: string;
}

export interface UserPaymentMethodRes {
  id: string;
  type: string; // e.g., 'card', 'bank_account'
  brand?: string; // e.g., 'Visa', 'MasterCard'
  last4?: string; // Last 4 digits of the card or account number
  exp_month?: number; // Expiration month for cards
  exp_year?: number; // Expiration year for cards
  country?: string; // Country of the payment method
}

export interface ChildPermissionRes {
  child_id: string;
  access_to_store: boolean;

  // Permissions for store
  allow_video_games: boolean;
  allow_toys: boolean;
  item_price_limit: number;

  // Permissions for screen time
  weekday_screen_time_limit: number;
  weekend_screen_time_limit: number;
  weekday_screen_time_start: string;
  weekday_screen_time_end: string;
}

export interface ParentDashboardRes extends UserInfoRes {
  payment_method?: UserPaymentMethodRes;
  billing_history?: UserBillingHistoryRes[];
  children?: ChildDashboardRes[];
}

export interface ChildDashboardRes extends UserInfoRes, ChildPermissionRes {
  level: string;

  // subcription
  student_id: string;
  subscription_id: string;
  status: string;
  next_billing_date: string;
}

export interface StudentDashboardRes extends UserInfoRes {
  parent_id?: string;
  permissions?: ChildPermissionRes;
  level: string;

}
