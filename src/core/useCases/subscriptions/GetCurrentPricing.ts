import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";
import { GetAvailablePlan } from "./GetAvailablePlan";

export class GetCurrentPricing {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute() {
    const getAvailablePlan = new GetAvailablePlan(this.subscriptionRepository);
    const result = await getAvailablePlan.execute();

    const maxFounderSpots = Number(process.env.MAX_FOUNDER_SPOTS) || 20;
    const activeFoundersCount = await this.subscriptionRepository.countByPlanAndStatus(
      "founder",
      "active"
    );
    const spotsRemaining = Math.max(0, maxFounderSpots - activeFoundersCount);

    return {
      plan_type: result.plan,
      price: result.price,
      spots_remaining: result.plan === "founder" ? spotsRemaining : 0,
      message:
        result.plan === "founder"
          ? "Primeiros 20 anunciantes pagam metade pra sempre!"
          : "Plano normal",
    };
  }
}
