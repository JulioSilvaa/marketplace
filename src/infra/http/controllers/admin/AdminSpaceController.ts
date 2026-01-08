import { Request, Response } from "express";

import { SpaceAdapter } from "../../../adapters/SpaceAdapter";
import { AdminSpaceRepository } from "../../../repositories/sql/admin/AdminSpaceRepository";

const adminSpaceRepository = new AdminSpaceRepository();

export default class AdminSpaceController {
  static async list(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const result = await adminSpaceRepository.list(
        Number(page),
        Number(limit),
        search as string,
        status as string
      );
      const response = {
        data: result.data.map(item => SpaceAdapter.toOutputDTO(item.space, undefined, item.owner)),
        total: result.total,
      };
      return res.json(response);
    } catch (error) {
      console.error("Error in AdminSpaceController.list:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    await adminSpaceRepository.updateStatus(id, status);
    return res.status(204).send();
  }
}
