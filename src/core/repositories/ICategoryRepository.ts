import { CategoryEntity } from "../entities/CategoryEntity";

export interface ICategoryRepository {
  findAll(): Promise<CategoryEntity[]>;
}
