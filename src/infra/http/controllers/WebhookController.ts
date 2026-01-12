import { Buffer } from "buffer";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

import { SubscriptionUseCaseFactory } from "../../factories/SubscriptionUseCaseFactory";
import { StripeService } from "../../services/StripeService";

function logToFile(message: string) {
  const logPath = path.resolve(process.cwd(), "webhook.log");
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] [Controller] ${message}\n`);
}

export class WebhookController {
  async handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];
    logToFile(`Recebendo webhook. Assinatura: ${signature ? "Presente" : "AUSENTE"}`);

    if (!signature) {
      logToFile("Erro: Assinatura ausente");
      return res.status(400).send("Assinatura do webhook ausente");
    }

    try {
      const payload = (req as any).rawBody || req.body;
      logToFile(`Payload type: ${typeof payload}, IsBuffer: ${Buffer.isBuffer(payload)}`);

      const stripeService = new StripeService();
      const event = stripeService.constructEvent(payload, signature as string);
      logToFile(`Evento construído com sucesso: ${event.type}`);

      const handleStripeWebhook = SubscriptionUseCaseFactory.makeHandleStripeWebhook();
      await handleStripeWebhook.execute(event);

      logToFile("Evento processado com sucesso pelo UseCase");
      res.status(200).send({ received: true });
    } catch (err: any) {
      logToFile(`Erro Fatal no WebhookController: ${err.message}`);
      console.error(`Erro no webhook: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}

export default new WebhookController();
