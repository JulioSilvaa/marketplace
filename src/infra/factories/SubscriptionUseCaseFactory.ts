import { HandleStripeWebhook } from "../../core/useCases/stripe/HandleStripeWebhook";
import { CreateSubscription } from "../../core/useCases/subscriptions/Create";
import { CreateCheckoutSession } from "../../core/useCases/subscriptions/CreateCheckoutSession";
import { FindAllSubscriptions } from "../../core/useCases/subscriptions/FindAll";
import { FindAllByUserId } from "../../core/useCases/subscriptions/FindAllByUserId";
import { FindByUserIdSubscription } from "../../core/useCases/subscriptions/FindByUserId";
import { GetAvailablePlan } from "../../core/useCases/subscriptions/GetAvailablePlan";
import { GetCurrentPricing } from "../../core/useCases/subscriptions/GetCurrentPricing";
import { UpdateSubscription } from "../../core/useCases/subscriptions/Update";
import { SpaceRepositoryPrisma } from "../repositories/sql/SpaceRepositoryPrisma";
import { SubscriptionRepositoryPrisma } from "../repositories/sql/SubscriptionRepositoryPrisma";
import { UserRepositoryPrisma } from "../repositories/sql/UserRepositoryPrisma";
import { StripeService } from "../services/StripeService";

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

  static makeFindAllByUserId(): FindAllByUserId {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new FindAllByUserId(subscriptionRepository);
  }

  static makeUpdateSubscription(): UpdateSubscription {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new UpdateSubscription(subscriptionRepository);
  }

  static makeFindAllSubscriptions(): FindAllSubscriptions {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new FindAllSubscriptions(subscriptionRepository);
  }

  static makeCreateCheckoutSession(): CreateCheckoutSession {
    const spaceRepository = new SpaceRepositoryPrisma();
    const stripeService = new StripeService();
    const userRepository = new UserRepositoryPrisma();
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new CreateCheckoutSession(
      spaceRepository,
      stripeService,
      userRepository,
      subscriptionRepository
    );
  }

  static makeGetAvailablePlan(): GetAvailablePlan {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new GetAvailablePlan(subscriptionRepository);
  }

  static makeGetCurrentPricing(): GetCurrentPricing {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new GetCurrentPricing(subscriptionRepository);
  }

  static makeHandleStripeWebhook(): HandleStripeWebhook {
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    const spaceRepository = new SpaceRepositoryPrisma();
    const userRepository = new UserRepositoryPrisma();
    return new HandleStripeWebhook(subscriptionRepository, spaceRepository, userRepository);
  }
}
