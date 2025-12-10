import { SubscriptionEntity } from "../../core/entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../core/repositories/ISubscriptionRepository";
import { SubscriptionAdapter } from "../adapters/SubscriptionAdapter";
import { prisma } from "../db/prisma/client";

export class SubscriptionRepositoryPrisma implements ISubscriptionRepository {
  async create(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
    await prisma.subscription.create({
      data: {
        id: subscription.id!,
        user_id: subscription.user_id,
        plan: subscription.plan,
        price: subscription.price,
        status: subscription.status,
        trial_until: subscription.trial_until,
        next_billing_date: subscription.next_billing_date,
      },
    });
    return subscription;
  }

  async findByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const subData = await prisma.subscription.findFirst({
      where: { user_id: userId },
    });

    if (!subData) return null;

    return SubscriptionAdapter.toEntity(subData);
  }

  async update(subscription: SubscriptionEntity): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: subscription.plan,
        price: subscription.price,
        status: subscription.status,
        trial_until: subscription.trial_until,
        next_billing_date: subscription.next_billing_date,
      },
    });
  }
}
