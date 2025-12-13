import { NextFunction, Request, Response } from "express";

import { SearchUserDTO } from "../../../core/dtos/SearchUserDTO";
import { UserUseCaseFactory } from "../../factories/UserUseCaseFactory";

export default class UserController {
  static async add(req: Request, res: Response, next: NextFunction) {
    try {
      const createUser = UserUseCaseFactory.makeCreateUser();
      await createUser.execute(req.body);
      return res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const findAllUsers = UserUseCaseFactory.makeFindAllUsers();
      const data = await findAllUsers.execute();
      if (data.length === 0) {
        res.status(200).json({ message: "Lista vazia" });
      }
      return res.status(200).json({ data, total: data.length });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const findByIdUser = UserUseCaseFactory.makeFindByIdUser();
      const user = await findByIdUser.execute(id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      // TODO: Criar DeleteUser use case
      const repository = new (
        await import("../../repositories/sql/UserRepositoryPrisma")
      ).UserRepositoryPrisma();
      await repository.delete(id);

      return res.status(200).json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateUser = UserUseCaseFactory.makeUpdateUser();
      await updateUser.execute({ id, ...req.body });
      return res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const findByIdUser = UserUseCaseFactory.makeFindByIdUser();
      const user = await findByIdUser.execute(id);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json({ data: user });
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

      return res.status(200).json({ data: users });
    } catch (error) {
      next(error);
    }
  }
}
