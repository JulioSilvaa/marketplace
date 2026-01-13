import { SubscriptionEntity } from "../../entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";

export class FindAllByUserId {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionEntity[]> {
    return this.subscriptionRepository.findAllByUserId(userId);
  }
}
