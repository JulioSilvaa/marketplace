import { SubscriptionEntity } from "../../entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";

export class FindByUserIdSubscription {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findByUserId(userId);
  }
}
