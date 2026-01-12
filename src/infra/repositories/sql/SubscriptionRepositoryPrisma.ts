import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../../core/repositories/ISubscriptionRepository";
import { prisma } from "../../../lib/prisma";
import { SubscriptionAdapter } from "../../adapters/SubscriptionAdapter";

export class SubscriptionRepositoryPrisma implements ISubscriptionRepository {
  private prismaClient: any;

  constructor(prismaClient?: any) {
    this.prismaClient = prismaClient || prisma;
  }

  async create(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
    await this.prismaClient.subscriptions.create({
      data: {
        id: subscription.id!,
        user_id: subscription.user_id,
        space_id: subscription.space_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
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
    const subData = await this.prismaClient.subscriptions.findFirst({
      where: { user_id: userId },
    });

    if (!subData) return null;

    return SubscriptionAdapter.toEntity(subData);
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const subData = await this.prismaClient.subscriptions.findUnique({
      where: { id },
    });

    if (!subData) return null;

    return SubscriptionAdapter.toEntity(subData);
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionEntity | null> {
    const subData = await this.prismaClient.subscriptions.findFirst({
      where: { stripe_subscription_id: stripeSubscriptionId },
    });

    if (!subData) return null;

    return SubscriptionAdapter.toEntity(subData);
  }

  async findBySpaceId(spaceId: string): Promise<SubscriptionEntity | null> {
    const subData = await this.prismaClient.subscriptions.findFirst({
      where: { space_id: spaceId },
    });

    if (!subData) return null;

    return SubscriptionAdapter.toEntity(subData);
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    const subsData = await this.prismaClient.subscriptions.findMany();
    return subsData.map((sub: any) => SubscriptionAdapter.toEntity(sub));
  }

  async update(subscription: SubscriptionEntity): Promise<void> {
    await this.prismaClient.subscriptions.update({
      where: { id: subscription.id },
      data: {
        plan: subscription.plan,
        price: subscription.price,
        status: subscription.status,
        trial_until: subscription.trial_until,
        next_billing_date: subscription.next_billing_date,
        stripe_subscription_id: subscription.stripe_subscription_id,
      },
    });
  }

  async countByPlanAndStatus(plan: string, status: string): Promise<number> {
    return this.prismaClient.subscriptions.count({
      where: {
        plan,
        status,
      },
    });
  }
}
