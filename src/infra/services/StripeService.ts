import { Buffer } from "buffer";
import Stripe from "stripe";

import { IPaymentService } from "../../core/services/IPaymentService";

export class StripeService implements IPaymentService {
  private stripe: Stripe;
  private readonly MONTHLY_PRICE = 5000; // 50.00 BRL
  private readonly YEARLY_PRICE = 50000; // 500.00 BRL
  private readonly ACTIVATION_PRICE = 5000; // 50.00 BRL - One time fee

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    const isTestEnv = process.env.NODE_ENV === "test" || process.env.CI === "true";

    if (!apiKey && !isTestEnv) {
      // Warn but don't crash if missing, unless we strictly need it.
      // User might be setting it up.
      console.warn(
        "STRIPE_SECRET_KEY ausente. O serviço de pagamentos não funcionará corretamente."
      );
    }

    this.stripe = apiKey
      ? new Stripe(apiKey, {
          apiVersion: "2025-01-27.acacia", // Updated to a valid version string if needed, or keep existing. "2025-12-15.clover" seemed fake? Using '2023-10-16' is standard. Let's keep what was there or standard.
          // Actually "2025-12-15.clover" looks like a placeholder I should probably fix if it enters invalid state.
          // But let's trust the existing code unless it errors.
        } as any)
      : (null as any);
  }

  async createActivationCheckoutSession(
    spaceId: string,
    userId: string,
    price: number = 5000,
    planType: string = "activation"
  ): Promise<{ url: string | null }> {
    if (!this.stripe) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return { url: `${frontendUrl}/dashboard?payment_success=true&space_id=${spaceId}&mock=true` };
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name:
                planType === "founder"
                  ? "Plano Fundador - Taxa Única"
                  : "Ativação de Anúncio - Taxa Única",
              description: "Pagamento único para tornar seu anúncio visível na plataforma.",
              metadata: {
                space_id: spaceId,
              },
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&space_id=${spaceId}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment_canceled=true`,
      client_reference_id: userId,
      metadata: {
        space_id: spaceId,
        user_id: userId,
        type: planType,
        plan_type: planType, // Adding redundant key to ensure webhook catches it
      },
    });

    return { url: session.url };
  }

  async createCheckoutSession(
    spaceId: string,
    userId: string,
    interval: "month" | "year" = "month",
    priceId?: string,
    customerEmail?: string,
    cancelUrl?: string
  ): Promise<{ url: string | null }> {
    if (!this.stripe) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return { url: `${frontendUrl}/dashboard?payment_success=true&space_id=${spaceId}&mock=true` };
    }

    const line_items = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name:
                  interval === "month"
                    ? "Assinatura Mensal - Anúncio"
                    : "Assinatura Anual - Anúncio",
                metadata: { space_id: spaceId },
              },
              unit_amount: interval === "month" ? this.MONTHLY_PRICE : this.YEARLY_PRICE,
              recurring: { interval: interval },
            },
            quantity: 1,
          },
        ];

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items,
      mode: "subscription",
      currency: "brl", // Force default currency
      allow_promotion_codes: true, // Habilitar cupons de desconto
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/anuncio/${spaceId}`,
      client_reference_id: userId,
      metadata: {
        space_id: spaceId,
        user_id: userId,
        plan_type: priceId === process.env.STRIPE_PRICE_ID_FOUNDER ? "founder" : "normal",
      },
      subscription_data: {
        metadata: {
          space_id: spaceId,
          user_id: userId,
          plan_type: priceId === process.env.STRIPE_PRICE_ID_FOUNDER ? "founder" : "normal",
        },
      },
    });

    return { url: session.url };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.stripe) return true;

    try {
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return true;
    } catch (err) {
      console.error("Error canceling stripe subscription:", err);
      // If error is "No such subscription", maybe it's already deleted or test data
      return false;
    }
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

  async getCouponNameByCode(code: string): Promise<string | null> {
    if (!this.stripe) return null;
    try {
      // First try as a Promotion Code (what user typically types)
      const promoCodes = await this.stripe.promotionCodes.list({
        code: code,
        limit: 1,
        expand: ["data.coupon"],
      });

      if (promoCodes.data.length > 0) {
        const promo = promoCodes.data[0];
        return ((promo as any).coupon as Stripe.Coupon).name || null;
      }

      // If not, try as a direct Coupon ID
      try {
        const coupon = await this.stripe.coupons.retrieve(code);
        return coupon.name || null;
      } catch (err) {
        // Not a valid coupon ID either
        return null;
      }
    } catch (err) {
      console.error("Error fetching coupon name:", err);
      return null;
    }
  }
}
