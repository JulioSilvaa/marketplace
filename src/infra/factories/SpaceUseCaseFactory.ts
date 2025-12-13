import { CreateSpace } from "../../core/useCases/spaces/Create";
import { ListSpaces } from "../../core/useCases/spaces/List";
import { SpaceRepositoryPrisma } from "../repositories/sql/SpaceRepositoryPrisma";
import { SubscriptionRepositoryPrisma } from "../repositories/sql/SubscriptionRepositoryPrisma";
import { UserRepositoryPrisma } from "../repositories/sql/UserRepositoryPrisma";

export class SpaceUseCaseFactory {
  private static getSpaceRepository() {
    return new SpaceRepositoryPrisma();
  }

  private static getUserRepository() {
    return new UserRepositoryPrisma();
  }

  private static getSubscriptionRepository() {
    return new SubscriptionRepositoryPrisma();
  }

  static makeCreateSpace(): CreateSpace {
    return new CreateSpace(
      this.getSpaceRepository(),
      this.getUserRepository(),
      this.getSubscriptionRepository()
    );
  }

  static makeListSpaces(): ListSpaces {
    return new ListSpaces(this.getSpaceRepository());
  }
}
