import { SubscriptionEntity } from "../../core/entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../core/repositories/ISubscriptionRepository";

export class SubscriptionRepositoryInMemory implements ISubscriptionRepository {
  public subscriptions: SubscriptionEntity[] = [];

  async create(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
    this.subscriptions.push(subscription);
    return subscription;
  }

  async findByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const sub = this.subscriptions.find(s => s.user_id === userId);
    return sub || null;
  }

  async update(subscription: SubscriptionEntity): Promise<void> {
    const index = this.subscriptions.findIndex(s => s.id === subscription.id);
    if (index !== -1) {
      this.subscriptions[index] = subscription;
    }
  }
}
