import { CreateSpace } from "../../core/useCases/spaces/Create";
import { DeleteSpace } from "../../core/useCases/spaces/Delete";
import { FindAllSpaces } from "../../core/useCases/spaces/FindAll";
import { FindByIdSpace } from "../../core/useCases/spaces/FindById";
import { ListSpaces } from "../../core/useCases/spaces/List";
import { UpdateSpace } from "../../core/useCases/spaces/Update";
import { SpaceRepositoryPrisma } from "../repositories/sql/SpaceRepositoryPrisma";
import { SubscriptionRepositoryPrisma } from "../repositories/sql/SubscriptionRepositoryPrisma";
import { UserRepositoryPrisma } from "../repositories/sql/UserRepositoryPrisma";

export class SpaceUseCaseFactory {
  static makeCreateSpace(): CreateSpace {
    const spaceRepository = new SpaceRepositoryPrisma();
    const userRepository = new UserRepositoryPrisma();
    const subscriptionRepository = new SubscriptionRepositoryPrisma();
    return new CreateSpace(spaceRepository, userRepository, subscriptionRepository);
  }

  static makeListSpaces(): ListSpaces {
    const spaceRepository = new SpaceRepositoryPrisma();
    return new ListSpaces(spaceRepository);
  }

  static makeFindAllSpaces(): FindAllSpaces {
    const spaceRepository = new SpaceRepositoryPrisma();
    return new FindAllSpaces(spaceRepository);
  }

  static makeFindByIdSpace(): FindByIdSpace {
    const spaceRepository = new SpaceRepositoryPrisma();
    return new FindByIdSpace(spaceRepository);
  }

  static makeUpdateSpace(): UpdateSpace {
    const spaceRepository = new SpaceRepositoryPrisma();
    return new UpdateSpace(spaceRepository);
  }

  static makeDeleteSpace(): DeleteSpace {
    const spaceRepository = new SpaceRepositoryPrisma();
    return new DeleteSpace(spaceRepository);
  }
}
