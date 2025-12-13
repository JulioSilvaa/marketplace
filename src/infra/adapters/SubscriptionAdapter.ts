import { subscriptions } from "../../../generated/prisma/client";
import { SubscriptionListOutputDTO } from "../../core/dtos/SubscriptionListOutputDTO";
import { SubscriptionOutputDTO } from "../../core/dtos/SubscriptionOutputDTO";
import { SubscriptionEntity } from "../../core/entities/SubscriptionEntity";
import { SubscriptionStatus } from "../../types/Subscription";

export class SubscriptionAdapter {
  static toEntity(data: subscriptions): SubscriptionEntity {
    return SubscriptionEntity.create({
      id: data.id,
      user_id: data.user_id,
      plan: data.plan,
      price: data.price,
      status: data.status as SubscriptionStatus,
      trial_until: data.trial_until || undefined,
      next_billing_date: data.next_billing_date || undefined,
    });
  }

  static toOutputDTO(subscription: SubscriptionEntity): SubscriptionOutputDTO {
    return {
      id: subscription.id!,
      user_id: subscription.user_id,
      plan: subscription.plan,
      price: subscription.price,
      status: subscription.status,
      trial_until: subscription.trial_until?.toISOString(),
      next_billing_date: subscription.next_billing_date?.toISOString(),
      created_at: subscription.created_at?.toISOString(),
      updated_at: subscription.updated_at?.toISOString(),
    };
  }

  static toListOutputDTO(subscriptions: SubscriptionEntity[]): SubscriptionListOutputDTO {
    return {
      data: subscriptions.map(sub => this.toOutputDTO(sub)),
      total: subscriptions.length,
    };
  }
}
