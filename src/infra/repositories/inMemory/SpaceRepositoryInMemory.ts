import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { ISpaceRepository } from "../../../core/repositories/ISpaceRepository";

export class SpaceRepositoryInMemory implements ISpaceRepository {
  public spaces: SpaceEntity[] = [];

  async create(space: SpaceEntity): Promise<SpaceEntity> {
    this.spaces.push(space);
    return space;
  }

  async findById(id: string): Promise<SpaceEntity | null> {
    const space = this.spaces.find(s => s.id === id);
    return space || null;
  }

  async listByOwnerId(ownerId: string): Promise<SpaceEntity[]> {
    return this.spaces.filter(s => s.owner_id === ownerId);
  }
}
