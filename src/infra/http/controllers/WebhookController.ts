import crypto from "crypto";
import { Request, Response } from "express";

import { StripeService } from "../../services/StripeService";

export class WebhookController {
  async handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).send("Assinatura do webhook ausente");
    }

    try {
      const payload = (req as any).rawBody || req.body;
      const stripeService = new StripeService();
      const event = stripeService.constructEvent(payload, signature as string);
      const { prisma } = await import("../../../lib/prisma");

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;

          if (!session.metadata?.space_id || !session.metadata?.user_id) {
            console.warn("Checkout session missing metadata");
            break;
          }

          const { space_id, user_id, type } = session.metadata;

          // Create or update subscription record
          if (session.subscription) {
            await prisma.subscriptions.create({
              data: {
                id: crypto.randomUUID(),
                user_id: user_id,
                space_id: space_id,
                stripe_subscription_id: session.subscription,
                plan: session.amount_total === 50000 ? "yearly" : "monthly", // Simple heuristic
                price: session.amount_total ? session.amount_total / 100 : 0,
                status: "active",
                next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Rough estimate, updated by invoice event
              },
            });
          }

          // Activate space
          await prisma.spaces.update({
            where: { id: space_id },
            data: { status: "active" },
          });

          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as any;
          if (!invoice.subscription) break;

          const subscription = await prisma.subscriptions.findFirst({
            where: { stripe_subscription_id: invoice.subscription },
          });

          if (subscription) {
            await prisma.subscriptions.update({
              where: { id: subscription.id },
              data: {
                status: "active",
                next_billing_date: new Date(invoice.lines.data[0].period.end * 1000),
              },
            });

            // Ensure space is active
            if (subscription.space_id) {
              await prisma.spaces.update({
                where: { id: subscription.space_id },
                data: { status: "active" },
              });
            }
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          if (!invoice.subscription) break;

          const subscription = await prisma.subscriptions.findFirst({
            where: { stripe_subscription_id: invoice.subscription },
          });

          if (subscription) {
            await prisma.subscriptions.update({
              where: { id: subscription.id },
              data: { status: "past_due" },
            });
            // Don't deactivate space immediately on first failure usually, but logic depends on rule.
            // Leaving space active or setting to 'suspended' if needed.
          }
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as any;

          const subscription = await prisma.subscriptions.findFirst({
            where: { stripe_subscription_id: sub.id },
          });

          if (subscription) {
            await prisma.subscriptions.update({
              where: { id: subscription.id },
              data: { status: "canceled" },
            });

            if (subscription.space_id) {
              await prisma.spaces.update({
                where: { id: subscription.space_id },
                data: { status: "inactive" },
              });
            }
          }
          break;
        }
      }

      res.status(200).send({ received: true });
    } catch (err: any) {
      console.error(`Erro no webhook: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}

export default new WebhookController();
