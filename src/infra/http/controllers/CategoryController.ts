import { Request, Response } from "express";

import { GetCategories } from "../../../core/useCases/categories/GetCategories";
import { CategoryRepositoryPrisma } from "../../repositories/sql/CategoryRepositoryPrisma";

export default class CategoryController {
  static async index(req: Request, res: Response) {
    const categoryRepository = new CategoryRepositoryPrisma();
    const getCategories = new GetCategories(categoryRepository);

    const categories = await getCategories.execute();

    return res.json(categories);
  }
}
