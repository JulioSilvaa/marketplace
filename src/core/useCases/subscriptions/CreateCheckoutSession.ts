import { SubscriptionStatus } from "../../../types/Subscription";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";
import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IPaymentService } from "../../services/IPaymentService";
import { GetAvailablePlan } from "./GetAvailablePlan";

function verificationIsActive(sub: any) {
  return sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.TRIAL;
}

type Input = {
  spaceId: string;
  userId: string;
  interval?: "month" | "year" | "activation"; // Made optional and added 'activation' explicitly
};

type Output = {
  url: string | null;
};

export class CreateCheckoutSession {
  constructor(
    private spaceRepository: ISpaceRepository,
    private paymentService: IPaymentService,
    private userRepository: IUserRepository,
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute({ spaceId, userId, interval }: Input): Promise<Output> {
    const space = await this.spaceRepository.findById(spaceId);

    if (!space) {
      throw new Error("Espaço não encontrado");
    }

    if (space.owner_id !== userId) {
      throw new Error("Você não tem permissão para realizar esta ação");
    }

    // If interval is not provided or explicitly 'activation', verify if we should use activation flow.
    // Assuming default behavior for now: if no interval, it is activation.
    // Check if space already has a valid subscription
    const existingSubscription = await this.subscriptionRepository.findBySpaceId(spaceId);

    if (existingSubscription && verificationIsActive(existingSubscription)) {
      // If subscription is active, valid, or past_due (waiting payment but technically existing),
      // we should just REACTIVATE the space without charging again if it was paused.

      // But if it is past_due, maybe we DO want to charge?
      // The user requirement is: "if paid... do not charge again".
      // So if status is ACTIVE, just reactivate space.

      if (existingSubscription.status === "active") {
        await this.spaceRepository.updateStatus(spaceId, "active");
        return { url: null };
      }
    }

    // If interval is not provided or explicitly 'activation', verify if we should use activation flow.
    // Assuming default behavior for now: if no interval, it is activation.
    if (interval === "activation") {
      return this.paymentService.createActivationCheckoutSession(spaceId, userId);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const getAvailablePlan = new GetAvailablePlan(this.subscriptionRepository);
    const plan = await getAvailablePlan.execute();

    return this.paymentService.createCheckoutSession(
      spaceId,
      userId,
      interval || "month",
      plan.priceId,
      user.email
    );
  }
}
