import { ListSpacesDTO } from "../../dtos/ListSpacesDTO";
import { SpaceEntity } from "../../entities/SpaceEntity";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export class ListSpaces {
  constructor(private spaceRepository: ISpaceRepository) {}

  async executeByOwner(input: ListSpacesDTO): Promise<SpaceEntity[]> {
    return this.spaceRepository.listByOwnerId(input.owner_id);
  }

  async executeByOwnerWithMetrics(
    input: ListSpacesDTO
  ): Promise<import("../../repositories/ISpaceRepository").SpaceWithMetrics[]> {
    return this.spaceRepository.listByOwnerIdWithMetrics(input.owner_id);
  }
}
