import { PricingModelEntity } from "../entities/PricingModelEntity";

export interface IPricingModelRepository {
  findAll(): Promise<PricingModelEntity[]>;
}
