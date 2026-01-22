import { IPricingModelRepository } from "../../repositories/IPricingModelRepository";

export class GetPricingModels {
  constructor(private pricingModelRepository: IPricingModelRepository) {}

  async execute() {
    return await this.pricingModelRepository.findAll();
  }
}
