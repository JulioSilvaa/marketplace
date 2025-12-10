import { SpaceEntity } from "../entities/SpaceEntity";

export interface ISpaceRepository {
  create(space: SpaceEntity): Promise<SpaceEntity>;
  findById(id: string): Promise<SpaceEntity | null>;
  listByOwnerId(ownerId: string): Promise<SpaceEntity[]>;
}
