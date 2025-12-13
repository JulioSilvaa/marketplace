import { CreateSubscription } from "../../core/useCases/subscriptions/Create";
import { FindAllSubscriptions } from "../../core/useCases/subscriptions/FindAll";
import { FindByUserIdSubscription } from "../../core/useCases/subscriptions/FindByUserId";
import { UpdateSubscription } from "../../core/useCases/subscriptions/Update";
import { SubscriptionRepositoryPrisma } from "../repositories/sql/SubscriptionRepositoryPrisma";
import { UserRepositoryPrisma } from "../repositories/sql/UserRepositoryPrisma";

export class SubscriptionUseCaseFactory {
  static makeCreateSubscription(): CreateSubscription {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    const userRepository = new UserRepositoryPrisma();
    return new CreateSubscription(subscriptionRepository, userRepository);
  }

  static makeFindByUserIdSubscription(): FindByUserIdSubscription {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new FindByUserIdSubscription(subscriptionRepository);
  }

  static makeUpdateSubscription(): UpdateSubscription {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new UpdateSubscription(subscriptionRepository);
  }

  static makeFindAllSubscriptions(): FindAllSubscriptions {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new FindAllSubscriptions(subscriptionRepository);
  }
}
