import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";

export interface AvailablePlanOutput {
  available: boolean;
  plan: "founder" | "normal";
  price: number;
  priceId: string;
}

export class GetAvailablePlan {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(): Promise<AvailablePlanOutput> {
    const maxFounderSpots = Number(process.env.MAX_FOUNDER_SPOTS) || 20;
    const founderPriceId = process.env.STRIPE_PRICE_ID_FOUNDER;
    const normalPriceId = process.env.STRIPE_PRICE_ID_NORMAL;

    if (!founderPriceId || !normalPriceId) {
      throw new Error("Stripe price IDs are not configured in environment variables.");
    }

    const activeFoundersCount = await this.subscriptionRepository.countByPlanAndStatus(
      "founder",
      "active"
    );

    if (activeFoundersCount < maxFounderSpots) {
      return {
        available: true,
        plan: "founder",
        price: 25,
        priceId: founderPriceId,
      };
    }

    return {
      available: false,
      plan: "normal",
      price: 50,
      priceId: normalPriceId,
    };
  }
}
