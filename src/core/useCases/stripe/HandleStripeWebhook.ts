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
          logToFile("[Webhook] Processando checkout.session.completed");
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case "invoice.payment_succeeded":
          logToFile("[Webhook] Processando invoice.payment_succeeded");
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case "invoice.payment_failed":
          logToFile("[Webhook] Processando invoice.payment_failed");
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case "customer.subscription.deleted":
          logToFile("[Webhook] Processando customer.subscription.deleted");
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          logToFile(`[Webhook] Evento não tratado: ${event.type}`);
      }
    } catch (error: any) {
      logToFile(`[Webhook Error] Falha ao processar ${event.type}: ${error.message}`);
      if (error.stack) logToFile(error.stack);
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata || {};
    logToFile(`[Webhook] Metadata da sessão: ${JSON.stringify(metadata)}`);
    logToFile(
      `[Webhook] Detalhes da sessão: ${JSON.stringify({
        id: session.id,
        customer: session.customer,
        subscription: session.subscription,
        amount: session.amount_total,
        mode: session.mode,
        client_ref: session.client_reference_id,
      })}`
    );

    const user_id = metadata.user_id || session.client_reference_id;
    const space_id = metadata.space_id;

    if (!user_id || !space_id) {
      logToFile(
        `[Webhook] Erro CRÍTICO: Checkout session sem IDs essenciais (user_id/space_id): session_id=${session.id} user_id=${user_id} space_id=${space_id}`
      );
      return;
    }

    const plan_type =
      metadata.plan_type || metadata.type || (session.mode === "payment" ? "activation" : "normal");
    const stripe_subscription_id = session.subscription as string;
    const stripe_customer_id = session.customer as string;

    // 1. Update user with stripe_customer_id
    try {
      if (stripe_customer_id) {
        logToFile(
          `[Webhook] Atualizando usuário ${user_id} com cliente stripe ${stripe_customer_id}`
        );
        await this.userRepository.update(user_id, { stripe_customer_id });
      }
    } catch (userErr: any) {
      logToFile(
        `[Webhook User Update Warning] Não foi possível atualizar stripe_customer_id: ${userErr.message}`
      );
      // Continue anyway, as the subscription is more important
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
      logToFile(`[Webhook] Registro de pagamento persistido com sucesso.`);
    } catch (dbError: any) {
      logToFile(`[Webhook DB Error] FALHA FATAL ao salvar no banco de dados: ${dbError.message}`);
      // Don't throw here to allow space activation to at least try to run?
      // Actually, if DB fails, throw so Stripe retries.
      throw dbError;
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
