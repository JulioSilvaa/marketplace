import { Request, Response } from "express";

import { SpaceAdapter } from "../../adapters/SpaceAdapter";
import { SpaceUseCaseFactory } from "../../factories/SpaceUseCaseFactory";

class SpaceController {
  async add(req: Request, res: Response) {
    try {
      // user_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const createSpace = SpaceUseCaseFactory.makeCreateSpace();
      const space = await createSpace.execute({
        ...req.body,
        owner_id, // Sobrescreve qualquer owner_id do body
      });

      const output = SpaceAdapter.toOutputDTO(space);

      return res.status(201).json({
        message: "Espaço criado com sucesso",
        data: output,
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

      const output = SpaceAdapter.toListOutputDTO(spaces);

      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao listar espaços" });
    }
  }

  async getAllSpaces(req: Request, res: Response) {
    try {
      const findAllSpaces = SpaceUseCaseFactory.makeFindAllSpaces();
      const spaces = await findAllSpaces.execute();

      const output = SpaceAdapter.toListOutputDTO(spaces);

      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao listar espaços" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const findByIdSpace = SpaceUseCaseFactory.makeFindByIdSpace();
      const space = await findByIdSpace.execute(id);

      if (!space) {
        return res.status(404).json({ message: "Espaço não encontrado" });
      }

      const output = SpaceAdapter.toOutputDTO(space);

      return res.status(200).json({ data: output });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao buscar espaço" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // owner_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const updateSpace = SpaceUseCaseFactory.makeUpdateSpace();
      await updateSpace.execute({ id, owner_id, ...req.body });

      return res.status(200).json({ message: "Espaço atualizado com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao atualizar espaço" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // owner_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const deleteSpace = SpaceUseCaseFactory.makeDeleteSpace();
      await deleteSpace.execute({ id, owner_id });

      return res.status(200).json({ message: "Espaço excluído com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao excluir espaço" });
    }
  }
}

export default new SpaceController();
