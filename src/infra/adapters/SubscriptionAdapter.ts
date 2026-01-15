import { subscriptions } from "@prisma/client";

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
      stripe_subscription_id: data.stripe_subscription_id || undefined,
      space_id: data.space_id || undefined,
      trial_until: data.trial_until || undefined,
      next_billing_date: data.next_billing_date || undefined,
      cancel_at_period_end: data.cancel_at_period_end,
      coupon_code: (data as any).coupon_code || undefined,
    });
  }

  static toOutputDTO(subscription: SubscriptionEntity): SubscriptionOutputDTO {
    return {
      id: subscription.id!,
      user_id: subscription.user_id,
      plan: subscription.plan,
      price: subscription.price,
      status: subscription.status,
      stripe_subscription_id: subscription.stripe_subscription_id,
      space_id: subscription.space_id,
      trial_until: subscription.trial_until?.toISOString(),
      next_billing_date: subscription.next_billing_date?.toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      coupon_code: subscription.coupon_code,
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
