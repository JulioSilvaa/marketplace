import { Subscription } from "@prisma/client";

import { SubscriptionEntity } from "../../core/entities/SubscriptionEntity";
import { SubscriptionStatus } from "../../types/Subscription";

export class SubscriptionAdapter {
  static toEntity(data: Subscription): SubscriptionEntity {
    return SubscriptionEntity.create({
      id: data.id,
      user_id: data.user_id,
      plan: data.plan,
      price: data.price,
      status: data.status as SubscriptionStatus,
      trial_until: data.trial_until || undefined,
      next_billing_date: data.next_billing_date || undefined,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
    });
  }
}
