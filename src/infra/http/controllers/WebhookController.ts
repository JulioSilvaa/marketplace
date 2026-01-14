import { Buffer } from "buffer";
import { Request, Response } from "express";

import { SubscriptionUseCaseFactory } from "../../factories/SubscriptionUseCaseFactory";
import { StripeService } from "../../services/StripeService";

function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [WebhookController] ${message}`);
}

export class WebhookController {
  async handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];
    log(`Recebendo webhook. Assinatura: ${signature ? "Presente" : "AUSENTE"}`);

    if (!signature) {
      log("Erro: Assinatura ausente");
      return res.status(400).send("Assinatura do webhook ausente");
    }

    try {
      const payload = (req as any).rawBody || req.body;
      log(`Payload type: ${typeof payload}, IsBuffer: ${Buffer.isBuffer(payload)}`);

      const stripeService = new StripeService();
      const event = stripeService.constructEvent(payload, signature as string);
      log(`Evento construído com sucesso: ${event.type}`);

      const handleStripeWebhook = SubscriptionUseCaseFactory.makeHandleStripeWebhook();
      await handleStripeWebhook.execute(event);

      log("Evento processado com sucesso pelo UseCase");
      res.status(200).send({ received: true });
    } catch (err: any) {
      log(`Erro Fatal no WebhookController: ${err.message}`);
      // console.error(`Erro no webhook: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}

export default new WebhookController();
