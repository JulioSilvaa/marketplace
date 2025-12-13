import { Request, Response } from "express";

import { SpaceUseCaseFactory } from "../../factories/SpaceUseCaseFactory";

class SpaceController {
  async add(req: Request, res: Response) {
    try {
      const createSpace = SpaceUseCaseFactory.makeCreateSpace();
      const space = await createSpace.execute(req.body);

      return res.status(201).json({
        message: "Espaço criado com sucesso",
        data: {
          id: space.id,
          title: space.title,
          owner_id: space.owner_id,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao criar espaço" });
    }
  }

  async getSpaces(req: Request, res: Response) {
    try {
      const { owner_id } = req.query;

      if (!owner_id || typeof owner_id !== "string") {
        return res.status(400).json({ message: "owner_id é obrigatório" });
      }

      const listSpaces = SpaceUseCaseFactory.makeListSpaces();
      const spaces = await listSpaces.executeByOwner({ owner_id });

      return res.status(200).json({
        data: spaces,
        total: spaces.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao listar espaços" });
    }
  }
}

export default new SpaceController();
