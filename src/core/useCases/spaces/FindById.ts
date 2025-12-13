import { SpaceEntity } from "../../entities/SpaceEntity";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export class FindByIdSpace {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(id: string): Promise<SpaceEntity | null> {
    return this.spaceRepository.findById(id);
  }
}
