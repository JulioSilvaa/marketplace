import { NextFunction, Request, Response } from "express";

import { SearchUserDTO } from "../../../core/dtos/SearchUserDTO";
import { CreateUser } from "../../../core/useCases/users/Create";
import { FindAllUsers } from "../../../core/useCases/users/FindAll";
import { FindByIdUser } from "../../../core/useCases/users/FindById";
import { SearchUser } from "../../../core/useCases/users/Search";
import { UpdateUser } from "../../../core/useCases/users/Update";
import { UserRepositoryPrisma } from "../../repositories/UserRepositoryPrisma";

export default class UserController {
  static async add(req: Request, res: Response, next: NextFunction) {
    try {
      const userSQL = new UserRepositoryPrisma();
      const user = new CreateUser(userSQL);
      await user.execute(req.body);
      return res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const userSQL = new UserRepositoryPrisma();
      const users = new FindAllUsers(userSQL);
      const data = await users.execute();
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
      const userSQL = new UserRepositoryPrisma();
      const user = await userSQL.findById(id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      await userSQL.delete(id);

      return res.status(200).json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userSQL = new UserRepositoryPrisma();
      const user = await userSQL.findById(id);

      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      const editUser = new UpdateUser(userSQL);
      await editUser.execute({ id: user.id, ...req.body });
      return res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userSQL = new UserRepositoryPrisma();
      const getUserById = new FindByIdUser(userSQL);
      const user = await getUserById.execute(id as any);

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

      const userSQL = new UserRepositoryPrisma();
      const searchUsers = new SearchUser(userSQL);

      const users = await searchUsers.execute(filters);

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
