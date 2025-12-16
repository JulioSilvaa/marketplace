import { CreateUser } from "../../core/useCases/users/Create";
import { DeleteUser } from "../../core/useCases/users/Delete";
import { FindAllUsers } from "../../core/useCases/users/FindAll";
import { FindByIdUser } from "../../core/useCases/users/FindById";
import { SearchUser } from "../../core/useCases/users/Search";
import { UpdateUser } from "../../core/useCases/users/Update";
import { UserRepositoryPrisma } from "../repositories/sql/UserRepositoryPrisma";
import { BcryptHashService } from "../services/BcryptHashService";
import { CryptoUuidGenerator } from "../services/CryptoUuidGenerator";

export class UserUseCaseFactory {
  static makeCreateUser(): CreateUser {
    const userRepository = new UserRepositoryPrisma();
    const hashService = new BcryptHashService();
    const uuidGenerator = new CryptoUuidGenerator();
    return new CreateUser(userRepository, hashService, uuidGenerator);
  }

  static makeFindByIdUser(): FindByIdUser {
    const userRepository = new UserRepositoryPrisma();
    return new FindByIdUser(userRepository);
  }

  static makeFindAllUsers(): FindAllUsers {
    const userRepository = new UserRepositoryPrisma();
    return new FindAllUsers(userRepository);
  }

  static makeSearchUser(): SearchUser {
    const userRepository = new UserRepositoryPrisma();
    return new SearchUser(userRepository);
  }

  static makeUpdateUser(): UpdateUser {
    const userRepository = new UserRepositoryPrisma();
    return new UpdateUser(userRepository);
  }

  static makeDeleteUser(): DeleteUser {
    const userRepository = new UserRepositoryPrisma();
    return new DeleteUser(userRepository);
  }
}
