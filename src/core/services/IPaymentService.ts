export interface IPaymentService {
  createCheckoutSession(
    spaceId: string,
    userId: string,
    interval?: "month" | "year",
    priceId?: string,
    customerEmail?: string,
    cancelUrl?: string
  ): Promise<{ url: string | null }>;

  createActivationCheckoutSession(
    spaceId: string,
    userId: string,
    price?: number,
    planType?: string
  ): Promise<{ url: string | null }>;
}
