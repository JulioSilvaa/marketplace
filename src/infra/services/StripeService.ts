import { Buffer } from "buffer";
import Stripe from "stripe";

import { IPaymentService } from "../../core/services/IPaymentService";

export class StripeService implements IPaymentService {
  private stripe: Stripe;
  private readonly MONTHLY_PRICE = 5000; // 50.00 BRL
  private readonly YEARLY_PRICE = 50000; // 500.00 BRL

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    const isTestEnv = process.env.NODE_ENV === "test" || process.env.CI === "true";

    if (!apiKey && !isTestEnv) {
      throw new Error("STRIPE_SECRET_KEY não está definida nas variáveis de ambiente");
    }

    this.stripe = apiKey
      ? new Stripe(apiKey, {
          apiVersion: "2025-12-15.clover",
        })
      : (null as any);
  }

  async createCheckoutSession(
    spaceId: string,
    userId: string,
    interval: "month" | "year"
  ): Promise<{ url: string | null }> {
    if (!this.stripe) {
      console.log(
        `[TEST MODE] Checkout session would be created for space ${spaceId} (${interval})`
      );
      return { url: "http://localhost:3000/success_mock" };
    }

    const price = interval === "month" ? this.MONTHLY_PRICE : this.YEARLY_PRICE;
    const productName = interval === "month" ? "Assinatura Mensal" : "Assinatura Anual";

    // Metadata to track the space and user
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `${productName} - Anúncio`,
              metadata: {
                space_id: spaceId,
              },
            },
            unit_amount: price,
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/dashboard/espacos?success=true&space_id=${spaceId}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/espacos?canceled=true`,
      client_reference_id: userId,
      metadata: {
        space_id: spaceId,
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          space_id: spaceId,
          user_id: userId,
        },
      },
    });

    return { url: session.url };
  }

  // Adding webhook handler logic here as public method, though usually controller calls it.
  // We need to return the constructEvent result.
  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET missing");

    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
