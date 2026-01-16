import { ICategoryRepository } from "../../repositories/ICategoryRepository";

export class GetCategories {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute() {
    return this.categoryRepository.findAll();
  }
}
