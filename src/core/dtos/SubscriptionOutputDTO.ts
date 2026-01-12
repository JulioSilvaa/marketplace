import { SubscriptionStatus } from "../../types/Subscription";

export interface SubscriptionOutputDTO {
  id: string;
  user_id: string;
  plan: string;
  price: number;
  status: SubscriptionStatus;
  stripe_subscription_id?: string;
  space_id?: string;
  trial_until?: string; // ISO date string
  next_billing_date?: string; // ISO date string
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}
