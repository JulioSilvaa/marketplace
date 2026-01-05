import { Request, Response } from "express";

import { StripeService } from "../../services/StripeService";

export class WebhookController {
  async handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).send("Assinatura do webhook ausente");
    }

    try {
      // In Express with body-parser, req.body might be parsed JSON.
      // Stripe requires raw body.
      // We assume raw body is available, maybe via a middleware or config.
      // If not, we might need to adjust app setup.
      // For now, let's assume req.body is buffer if application/json parser is not applied to this route?
      // Or we check how to get raw body.
      // Usually: req.rawBody or similar if configured.
      // Safe bet: assume we can access raw buffer.

      const payload = (req as any).rawBody || req.body;

      const stripeService = new StripeService();
      const event = stripeService.constructEvent(payload, signature as string);

      console.log(`Evento Stripe recebido: ${event.type}`);

      // Handle subscription events
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any; // Stripe.Checkout.Session
          // TODO: specific logic to activate space
          console.log("Checkout concluído:", session);

          if (session.metadata && session.metadata.space_id) {
            console.log(`Ativando espaço ${session.metadata.space_id}`);
            // Call a use case to activate space?
            // Or direct repo call (not ideal but quick).
            // Better: SubscriptionUseCaseFactory.makeActivateSubscription(spaceId, ...)
          }
          break;
        }
        case "invoice.payment_succeeded":
          // Handle recurring payment success
          break;
        default:
          console.log(`Tipo de evento não tratado: ${event.type}`);
      }

      res.status(200).send({ received: true });
    } catch (err: any) {
      console.error(`Erro no webhook: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}

export default new WebhookController();
