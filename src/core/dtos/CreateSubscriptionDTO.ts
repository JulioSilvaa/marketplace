import { SubscriptionStatus } from "../../types/Subscription";

export interface CreateSubscriptionDTO {
  user_id: string;
  plan: string;
  price?: number;
  status?: SubscriptionStatus;
}
