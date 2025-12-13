import { CreateUser } from "../../core/useCases/users/Create";
import { FindAllUsers } from "../../core/useCases/users/FindAll";
import { FindByIdUser } from "../../core/useCases/users/FindById";
import { SearchUser } from "../../core/useCases/users/Search";
import { UpdateUser } from "../../core/useCases/users/Update";
import { UserRepositoryPrisma } from "../repositories/sql/UserRepositoryPrisma";
import { BcryptHashService } from "../services/BcryptHashService";
import { CryptoUuidGenerator } from "../services/CryptoUuidGenerator";

export class UserUseCaseFactory {
  private static getUserRepository() {
    return new UserRepositoryPrisma();
  }

  private static getHashService() {
    return new BcryptHashService();
  }

  private static getUuidGenerator() {
    return new CryptoUuidGenerator();
  }

  static makeCreateUser(): CreateUser {
    return new CreateUser(this.getUserRepository(), this.getHashService(), this.getUuidGenerator());
  }

  static makeFindAllUsers(): FindAllUsers {
    return new FindAllUsers(this.getUserRepository());
  }

  static makeFindByIdUser(): FindByIdUser {
    return new FindByIdUser(this.getUserRepository());
  }

  static makeUpdateUser(): UpdateUser {
    return new UpdateUser(this.getUserRepository());
  }

  static makeSearchUser(): SearchUser {
    return new SearchUser(this.getUserRepository());
  }
}
