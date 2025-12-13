import { SubscriptionEntity } from "../../entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";

export class FindAllSubscriptions {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(): Promise<SubscriptionEntity[]> {
    return this.subscriptionRepository.findAll();
  }
}
