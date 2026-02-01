import { Request, Response } from "express";

import { UserAdapter } from "../../../adapters/UserAdapter";
import { AdminCustomerRepository } from "../../../repositories/sql/admin/AdminCustomerRepository";

const adminCustomerRepository = new AdminCustomerRepository();

export default class AdminCustomerController {
  static async list(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const result = await adminCustomerRepository.list(
        Number(page),
        Number(limit),
        search as string
      );

      const response = {
        data: result.data.map(user => UserAdapter.toOutputDTO(user)),
        total: result.total,
      };

      return res.json(response);
    } catch (error) {
      console.error("Error in AdminCustomerController.list:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await adminCustomerRepository.delete(id as string);
    return res.status(204).send();
  }

  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    await adminCustomerRepository.updateStatus(id as string, status);
    return res.status(204).send();
  }
}
