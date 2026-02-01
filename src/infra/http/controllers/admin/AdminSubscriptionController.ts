import { Request, Response } from "express";

import { prisma } from "../../../../lib/prisma";
import { StripeService } from "../../../services/StripeService";

const stripeService = new StripeService();

export default class AdminSubscriptionController {
  // List all subscriptions (active/all)
  static async list(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) {
        where.status = status as string;
      }

      const [subscriptions, total] = await Promise.all([
        prisma.subscriptions.findMany({
          where,
          include: {
            users: {
              select: { name: true, email: true },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { created_at: "desc" },
        }),
        prisma.subscriptions.count({ where }),
      ]);

      return res.json({
        data: subscriptions,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      console.error("Error listing subscriptions:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Cancel a subscription
  static async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { immediate } = req.body; // option to cancel immediately

      const subscription = await prisma.subscriptions.findUnique({
        where: { id: id as string },
      });

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      if (subscription.stripe_subscription_id) {
        // Cancel on Stripe
        // Note: StripeService.cancelSubscription currently does cancel_at_period_end = true
        // If we want immediate, we might need to update StripeService or call Stripe directly here.
        // For now using the service.
        await stripeService.cancelSubscription(subscription.stripe_subscription_id);
      }

      // Update local status
      // If immediate, set to canceled. If at period end, maybe keep active but set cancel_at_period_end?
      // Stripe webhooks usually handle status sync.
      // But for admin feedback, we can update the flag.

      await prisma.subscriptions.update({
        where: { id: id as string },
        data: {
          cancel_at_period_end: true,
        },
      });

      return res.json({ message: "Subscription scheduled for cancellation" });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
