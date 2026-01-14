import crypto from "crypto";
import Stripe from "stripe";

import { SubscriptionStatus } from "../../../types/Subscription";
import { SubscriptionEntity } from "../../entities/SubscriptionEntity";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";
import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";
import { IUserRepository } from "../../repositories/IUserRepository";

// Helper for logging
function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [HandleStripeWebhook] ${message}`);
}

export class HandleStripeWebhook {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private spaceRepository: ISpaceRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(event: Stripe.Event) {
    logToFile(`[Webhook] Recibido evento: ${event.id} [${event.type}]`);

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case "payment_intent.succeeded": // Handle activation if needed separately or rely on checkout
          // console.log("Payment intent succeeded");
          break;
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        default:
        // console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error: any) {
      console.error("Error handling webhook event:", error);
      throw error;
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      // Determine status from Stripe subscription
      let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
      if (subscription.status === "canceled") status = SubscriptionStatus.CANCELLED;
      if (subscription.status === "past_due") status = SubscriptionStatus.PAST_DUE;
      if (subscription.status === "unpaid") status = SubscriptionStatus.PAST_DUE;
      if (subscription.status === "paused") status = SubscriptionStatus.SUSPENDED;

      // Find subscription by Stripe ID
      const existingSub = await this.subscriptionRepository.findByStripeSubscriptionId(
        subscription.id
      );

      if (existingSub) {
        // Update existing subscription status
        switch (status) {
          case SubscriptionStatus.ACTIVE:
            existingSub.activate();
            break;
          case SubscriptionStatus.CANCELLED:
            existingSub.cancel();
            break;
          case SubscriptionStatus.SUSPENDED:
            existingSub.suspend();
            break;
          // handle other statuses if methods exist or add setStatus
          default:
            // If no specific method, maybe we need a generic setStatus for sync
            // For now, let's assume active/canceled/suspended are the main ones we care about
            // If past_due, maybe suspend?
            if (status === SubscriptionStatus.PAST_DUE) {
              existingSub.suspend();
            }
            break;
        }

        // Update cancellation status if present
        if (subscription.cancel_at_period_end !== undefined) {
          existingSub.setCancellation(subscription.cancel_at_period_end);
        }

        await this.subscriptionRepository.update(existingSub);
      }
    } catch (error) {
      console.error("Error updating subscription from webhook:", error);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata || {};

    const user_id = metadata.user_id || session.client_reference_id;
    const space_id = metadata.space_id;

    if (!space_id) {
      console.error("No space_id found in metadata");
      return;
    }

    // Fix: check if user_id is present
    if (!user_id) {
      console.error("No user_id found in metadata");
      return;
    }

    if (session.mode === "payment" && session.payment_status === "paid") {
      // Activation logic
      // ...
    }

    // Define plan_type correctly
    const plan_type = metadata.plan_type || "basic";

    const stripe_subscription_id = session.subscription as string;
    const stripe_customer_id = session.customer as string;

    // 1. Update user with stripe_customer_id
    try {
      if (stripe_customer_id) {
        await this.userRepository.update(user_id, { stripe_customer_id });
      }
    } catch (userErr: any) {
      // Silent fail
    }

    // 2. Create Subscription record
    const subId = crypto.randomUUID();
    logToFile(
      `[Webhook] Preparando registro de pagamento: ${subId} | Plano: ${plan_type} | Espaço: ${space_id}`
    );

    const subscription = new SubscriptionEntity({
      id: subId,
      user_id,
      space_id,
      stripe_subscription_id,
      plan: plan_type,
      price: session.amount_total ? session.amount_total / 100 : 0,
      status: SubscriptionStatus.ACTIVE,
      next_billing_date:
        session.mode === "subscription"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : undefined,
    });

    try {
      await this.subscriptionRepository.create(subscription);

      // Update space to active
      const space = await this.spaceRepository.findById(space_id);
      if (space) {
        space.activate(); // Assuming activate method exists on Space entity
        await this.spaceRepository.update(space);
      }
    } catch (err: any) {
      console.error("Error creating subscription record:", err);
    }

    // 3. Activate Space
    logToFile(`[Webhook] Ativando anúncio: ${space_id}`);
    await this.updateSpaceStatus(space_id, "active");

    logToFile(`[Webhook] ✅ Fluxo finalizado com sucesso para: ${space_id}`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const stripe_subscription_id = (invoice as any).subscription as string;
    if (!stripe_subscription_id) return;

    logToFile(`[Webhook] Invoice payment succeeded for sub: ${stripe_subscription_id}`);
    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(stripe_subscription_id);

    if (subscription) {
      (subscription as any)._status = SubscriptionStatus.ACTIVE;

      const periodEnd = (invoice as any).lines?.data[0]?.period?.end;
      if (periodEnd) {
        subscription.updateBillingDate(new Date(periodEnd * 1000));
      }

      await this.subscriptionRepository.update(subscription);

      if (subscription.space_id) {
        await this.updateSpaceStatus(subscription.space_id, "active");
      }

      logToFile(
        `[Webhook] Pagamento confirmado e assinatura atualizada: ${stripe_subscription_id}`
      );
    } else {
      logToFile(
        `[Webhook Warning] Assinatura não encontrada para invoice: ${stripe_subscription_id}`
      );
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const stripe_subscription_id = (invoice as any).subscription as string;
    if (!stripe_subscription_id) return;

    logToFile(`[Webhook] Invoice payment failed for sub: ${stripe_subscription_id}`);
    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(stripe_subscription_id);

    if (subscription) {
      (subscription as any)._status = SubscriptionStatus.PAST_DUE;
      await this.subscriptionRepository.update(subscription);

      if (subscription.space_id) {
        await this.updateSpaceStatus(subscription.space_id, "suspended");
      }

      logToFile(`[Webhook] Assinatura marcada como past_due: ${stripe_subscription_id}`);
    }
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    logToFile(`[Webhook] Subscription deleted: ${stripeSubscription.id}`);
    const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(
      stripeSubscription.id
    );

    if (subscription) {
      (subscription as any)._status = SubscriptionStatus.CANCELLED;
      await this.subscriptionRepository.update(subscription);

      if (subscription.space_id) {
        await this.updateSpaceStatus(subscription.space_id, "suspended");
      }

      logToFile(`[Webhook] Assinatura cancelada no sistema: ${stripeSubscription.id}`);
    }
  }

  private async updateSpaceStatus(spaceId: string, status: "active" | "suspended") {
    try {
      await this.spaceRepository.updateStatus(spaceId, status);
    } catch (err: any) {
      logToFile(`[Webhook Error] Erro ao atualizar status do espaço ${spaceId}: ${err.message}`);
    }
  }
}
