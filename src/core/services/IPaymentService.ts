export interface IPaymentService {
  createCheckoutSession(
    spaceId: string,
    userId: string,
    interval: "month" | "year"
  ): Promise<{ url: string | null }>;

  createActivationCheckoutSession(spaceId: string, userId: string): Promise<{ url: string | null }>;
}
