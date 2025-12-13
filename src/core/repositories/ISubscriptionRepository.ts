import { SubscriptionEntity } from "../entities/SubscriptionEntity";

export interface ISubscriptionRepository {
  create(subscription: SubscriptionEntity): Promise<SubscriptionEntity>;
  findByUserId(userId: string): Promise<SubscriptionEntity | null>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  findAll(): Promise<SubscriptionEntity[]>;
  update(subscription: SubscriptionEntity): Promise<void>;
}
