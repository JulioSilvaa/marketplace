export class PricingModelEntity {
  constructor(
    public readonly id: string,
    public key: string,
    public label: string,
    public unit: string | null,
    public description: string | null
  ) {}
}
