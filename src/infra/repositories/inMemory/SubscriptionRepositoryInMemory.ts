import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../../core/repositories/ISubscriptionRepository";
import { SubscriptionStatus } from "../../../types/Subscription";

export class SubscriptionRepositoryInMemory implements ISubscriptionRepository {
  public subscriptions: SubscriptionEntity[] = [];

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionEntity | null> {
    const sub = this.subscriptions.find(s => s.stripe_subscription_id === stripeSubscriptionId);
    return sub || null;
  }

  async findBySpaceId(spaceId: string): Promise<SubscriptionEntity | null> {
    const sub = this.subscriptions.find(s => s.space_id === spaceId);
    return sub || null;
  }

  async countByPlanAndStatus(plan: string, status: SubscriptionStatus): Promise<number> {
    return this.subscriptions.filter(s => s.plan === plan && s.status === status).length;
  }

  async create(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
    this.subscriptions.push(subscription);
    return subscription;
  }

  async findByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const sub = this.subscriptions.find(s => s.user_id === userId);
    return sub || null;
  }

  async findAllByUserId(userId: string): Promise<SubscriptionEntity[]> {
    return this.subscriptions.filter(s => s.user_id === userId);
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const sub = this.subscriptions.find(s => s.id === id);
    return sub || null;
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    return this.subscriptions;
  }

  async update(subscription: SubscriptionEntity): Promise<void> {
    const index = this.subscriptions.findIndex(s => s.id === subscription.id);
    if (index !== -1) {
      this.subscriptions[index] = subscription;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.subscriptions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
    }
  }
}
