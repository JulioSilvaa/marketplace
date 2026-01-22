import { CategoryEntity } from "../../../core/entities/CategoryEntity";
import { ICategoryRepository } from "../../../core/repositories/ICategoryRepository";
import { prisma } from "../../../lib/prisma";

export class CategoryRepositoryPrisma implements ICategoryRepository {
  async findAll(): Promise<CategoryEntity[]> {
    const categories = await prisma.categories.findMany({
      include: {
        allowed_pricing_models: true,
      },
    });
    return categories.map(
      c =>
        new CategoryEntity(
          c.id,
          c.name,
          c.type as string, // Cast Enum to string
          c.allowed_pricing_models
        )
    );
  }
}
