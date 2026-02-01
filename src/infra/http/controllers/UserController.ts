import { NextFunction, Request, Response } from "express";

import { SearchUserDTO } from "../../../core/dtos/SearchUserDTO";
import { UserAdapter } from "../../adapters/UserAdapter";
import { UserUseCaseFactory } from "../../factories/UserUseCaseFactory";

export default class UserController {
  // Nota: Criação de usuário é feita via /auth/register

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const findAllUsers = UserUseCaseFactory.makeFindAllUsers();
      const users = await findAllUsers.execute();

      const output = UserAdapter.toListOutputDTO(users);

      if (users.length === 0) {
        return res.status(200).json({ message: "Lista vazia" });
      }
      return res.status(200).json(output);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user_id; // ID do usuário autenticado (do AuthMiddleware)

      // 🔒 PROTEÇÃO IDOR: Verificar se usuário está tentando deletar a si mesmo
      if (id !== requestingUserId) {
        return res.status(403).json({
          message: "Acesso negado. Você só pode deletar sua própria conta.",
        });
      }

      const deleteUser = UserUseCaseFactory.makeDeleteUser();
      await deleteUser.execute({ id: id as string });

      return res.status(200).json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user_id; // ID do usuário autenticado (do AuthMiddleware)

      // 🔒 PROTEÇÃO IDOR: Verificar se usuário está tentando atualizar a si mesmo
      if (id !== requestingUserId) {
        return res.status(403).json({
          message: "Acesso negado. Você só pode atualizar sua própria conta.",
        });
      }

      const updateUser = UserUseCaseFactory.makeUpdateUser();
      await updateUser.execute({ id: id as string, ...req.body });
      return res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const findByIdUser = UserUseCaseFactory.makeFindByIdUser();
      const user = await findByIdUser.execute(id as string);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const output = UserAdapter.toOutputDTO(user);

      return res.status(200).json({ data: output });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;

      const filters: SearchUserDTO = {
        name: typeof query.name === "string" ? query.name : undefined,
        email: typeof query.email === "string" ? query.email : undefined,

        isActive:
          query.isActive !== undefined
            ? query.isActive === "true" || query.isActive === "1"
            : undefined,
      };

      const searchUser = UserUseCaseFactory.makeSearchUser();
      const users = await searchUser.execute(filters);

      if (users.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhum usuário encontrado com os filtros fornecidos" });
      }

      const output = UserAdapter.toListOutputDTO(users);

      return res.status(200).json(output);
    } catch (error) {
      next(error);
    }
  }

  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const getMetrics = UserUseCaseFactory.makeGetUserMetrics();
      const metrics = await getMetrics.execute(id as string);

      return res.status(200).json(metrics);
    } catch (error) {
      next(error);
    }
  }
}
