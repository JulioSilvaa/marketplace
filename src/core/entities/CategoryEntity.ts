export class CategoryEntity {
  constructor(
    public readonly id: number,
    public name: string,
    public type?: string,
    public allowed_pricing_models?: any
  ) {}
}
