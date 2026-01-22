import { Request, Response } from "express";

import { prisma } from "../../../../lib/prisma";

export default class AdminConfigController {
  // --- Categories ---

  static async listCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.categories.findMany({
        include: {
          allowed_pricing_models: true,
        },
        orderBy: { id: "asc" },
      });
      return res.json(categories);
    } catch (error) {
      console.error("Error listing categories:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const { name, type, allowed_pricing_models } = req.body;
      // allowed_pricing_models expected to be an array of IDs

      const connect = allowed_pricing_models?.map((id: string) => ({ id })) || [];

      const category = await prisma.categories.create({
        data: {
          name,
          type,
          allowed_pricing_models: {
            connect: connect,
          },
        },
        include: { allowed_pricing_models: true },
      });
      return res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, type, allowed_pricing_models } = req.body;

      // Prepare relation update if provided
      let relationUpdate = undefined;
      if (allowed_pricing_models) {
        relationUpdate = {
          set: allowed_pricing_models.map((pid: string) => ({ id: pid })),
        };
      }

      const category = await prisma.categories.update({
        where: { id: Number(id) },
        data: {
          name,
          type,
          allowed_pricing_models: relationUpdate,
        },
        include: { allowed_pricing_models: true },
      });
      return res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.categories.delete({
        where: { id: Number(id) },
      });
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // --- Pricing Models ---

  static async listPricingModels(req: Request, res: Response) {
    try {
      const models = await prisma.pricing_models.findMany({
        orderBy: { label: "asc" },
      });
      return res.json(models);
    } catch (error) {
      console.error("Error listing pricing models:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async createPricingModel(req: Request, res: Response) {
    try {
      const { key, label, description, unit } = req.body;
      const model = await prisma.pricing_models.create({
        data: { key, label, description, unit },
      });
      return res.status(201).json(model);
    } catch (error) {
      console.error("Error creating pricing model:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async updatePricingModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { key, label, description, unit } = req.body;
      const model = await prisma.pricing_models.update({
        where: { id },
        data: { key, label, description, unit },
      });
      return res.json(model);
    } catch (error) {
      console.error("Error updating pricing model:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async deletePricingModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.pricing_models.delete({
        where: { id },
      });
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting pricing model:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
