import { SubscriptionEntity } from "../entities/SubscriptionEntity";

export interface ISubscriptionRepository {
  create(subscription: SubscriptionEntity): Promise<SubscriptionEntity>;
  findByUserId(userId: string): Promise<SubscriptionEntity | null>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionEntity | null>;
  findBySpaceId(spaceId: string): Promise<SubscriptionEntity | null>;
  findAll(): Promise<SubscriptionEntity[]>;
  update(subscription: SubscriptionEntity): Promise<void>;
  countByPlanAndStatus(plan: string, status: string): Promise<number>;
}
