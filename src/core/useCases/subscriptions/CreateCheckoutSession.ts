import { ISpaceRepository } from "../../repositories/ISpaceRepository";
import { IPaymentService } from "../../services/IPaymentService";

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
    private paymentService: IPaymentService
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
    if (!interval || interval === "activation") {
      return this.paymentService.createActivationCheckoutSession(spaceId, userId);
    }

    // TODO: Check if space already has active subscription?
    // For now, Stripe handles logic or we can just let them subscribe again (and assume upgrade/downgrade not needed yet)

    return this.paymentService.createCheckoutSession(spaceId, userId, interval);
  }
}
