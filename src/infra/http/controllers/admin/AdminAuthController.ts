import { Request, Response } from "express";

import { AdminUseCaseFactory } from "../../../../factories/AdminUseCaseFactory";

class AdminAuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const loginAdmin = AdminUseCaseFactory.makeLoginAdmin();
      const { admin, token } = await loginAdmin.execute({ email, password });

      return res.json({ admin, token });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro inesperado" });
    }
  }

  async me(req: Request, res: Response) {
    // Basic me impl, user_id is already in req from middleware
    return res.json({ id: req.user_id, role: "admin" });
  }
}

export default new AdminAuthController();
