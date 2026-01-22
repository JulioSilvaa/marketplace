import { PricingModelEntity } from "../../../core/entities/PricingModelEntity";
import { IPricingModelRepository } from "../../../core/repositories/IPricingModelRepository";
import { prisma } from "../../../lib/prisma";

export class PricingModelRepositoryPrisma implements IPricingModelRepository {
  async findAll(): Promise<PricingModelEntity[]> {
    const models = await prisma.pricing_models.findMany();
    return models.map(m => new PricingModelEntity(m.id, m.key, m.label, m.unit, m.description));
  }
}
