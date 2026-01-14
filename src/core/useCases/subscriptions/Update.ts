import { SubscriptionStatus } from "../../../types/Subscription";
import { SubscriptionEntity } from "../../entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";
import { IPaymentService } from "../../services/IPaymentService";

export interface UpdateSubscriptionDTO {
  id: string;
  plan?: string;
  price?: number;
  status?: SubscriptionStatus;
  next_billing_date?: Date;
  cancel_at_period_end?: boolean;
}

export class UpdateSubscription {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private paymentService: IPaymentService
  ) {}

  async execute(input: UpdateSubscriptionDTO): Promise<void> {
    // Find by id instead of user_id
    const subscription = await this.subscriptionRepository.findById(input.id);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Use entity methods to update
    if (input.plan !== undefined && input.price !== undefined) {
      subscription.changePlan(input.plan, input.price);
    } else if (input.plan !== undefined || input.price !== undefined) {
      // If only one is provided, use current value for the other
      const newPlan = input.plan ?? subscription.plan;
      const newPrice = input.price ?? subscription.price;
      subscription.changePlan(newPlan, newPrice);
    }

    if (input.status !== undefined) {
      if (input.status === SubscriptionStatus.ACTIVE) {
        subscription.activate();
      } else if (input.status === SubscriptionStatus.SUSPENDED) {
        subscription.suspend();
      } else if (input.status === SubscriptionStatus.CANCELLED) {
        subscription.cancel();
      }
      // For other statuses, we'd need additional methods in the entity
    }

    if (input.next_billing_date !== undefined) {
      subscription.updateBillingDate(input.next_billing_date);
    }

    if (input.cancel_at_period_end !== undefined) {
      if (input.cancel_at_period_end && subscription.stripe_subscription_id) {
        const success = await this.paymentService.cancelSubscription(
          subscription.stripe_subscription_id
        );
        if (!success) {
          // Log warning but proceed with local update? Or throw?
          // Proceeding to ensure DB reflects user intent even if Stripe fails (manual sync needed potentially)
          console.warn(
            `Failed to cancel Stripe subscription ${subscription.stripe_subscription_id}`
          );
        }
      }
      subscription.setCancellation(input.cancel_at_period_end);
    }

    await this.subscriptionRepository.update(subscription);
  }
}
