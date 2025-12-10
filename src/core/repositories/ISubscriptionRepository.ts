import { SubscriptionEntity } from "../entities/SubscriptionEntity";

export interface ISubscriptionRepository {
  create(subscription: SubscriptionEntity): Promise<SubscriptionEntity>;
  findByUserId(userId: string): Promise<SubscriptionEntity | null>;
  update(subscription: SubscriptionEntity): Promise<void>;
}
