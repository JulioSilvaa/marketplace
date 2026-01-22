import { Request, Response } from "express";

import { GetPricingModels } from "../../../core/useCases/pricing/GetPricingModels";
import { PricingModelRepositoryPrisma } from "../../repositories/sql/PricingModelRepositoryPrisma";

export default class PricingModelController {
  static async index(req: Request, res: Response) {
    const repository = new PricingModelRepositoryPrisma();
    const useCase = new GetPricingModels(repository);
    const models = await useCase.execute();
    return res.json(models);
  }
}
