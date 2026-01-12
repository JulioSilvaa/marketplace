import { Request, Response } from "express";

import { SubscriptionAdapter } from "../../adapters/SubscriptionAdapter";
import { SubscriptionUseCaseFactory } from "../../factories/SubscriptionUseCaseFactory";

class SubscriptionController {
  async add(req: Request, res: Response) {
    try {
      const createSubscription = SubscriptionUseCaseFactory.makeCreateSubscription();
      const subscription = await createSubscription.execute(req.body);

      const output = SubscriptionAdapter.toOutputDTO(subscription);

      return res.status(201).json({
        message: "Assinatura criada com sucesso",
        data: output,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao criar assinatura" });
    }
  }

  async getSubscriptions(req: Request, res: Response) {
    try {
      const findAllSubscriptions = SubscriptionUseCaseFactory.makeFindAllSubscriptions();
      const subscriptions = await findAllSubscriptions.execute();

      const output = SubscriptionAdapter.toListOutputDTO(subscriptions);

      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao listar assinaturas" });
    }
  }

  async findByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const findByUserId = SubscriptionUseCaseFactory.makeFindByUserIdSubscription();
      const subscription = await findByUserId.execute(userId);

      if (!subscription) {
        return res.status(404).json({ message: "Assinatura não encontrada" });
      }

      const output = SubscriptionAdapter.toOutputDTO(subscription);

      return res.status(200).json({ data: output });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao buscar assinatura" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updateSubscription = SubscriptionUseCaseFactory.makeUpdateSubscription();
      await updateSubscription.execute({ id, ...req.body });

      return res.status(200).json({ message: "Assinatura atualizada com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao atualizar assinatura" });
    }
  }
  async checkout(req: Request, res: Response) {
    try {
      const { spaceId, interval } = req.body;
      const userId = (req as any).user_id; // Using type casting to access user_id added by middleware

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const createCheckoutSession = SubscriptionUseCaseFactory.makeCreateCheckoutSession();
      const output = await createCheckoutSession.execute({ spaceId, userId, interval });

      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao criar sessão de checkout" });
    }
  }

  async getCurrentPricing(req: Request, res: Response) {
    try {
      const getCurrentPricing = SubscriptionUseCaseFactory.makeGetCurrentPricing();
      const output = await getCurrentPricing.execute();

      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao buscar informações de preços" });
    }
  }
}

export default new SubscriptionController();
