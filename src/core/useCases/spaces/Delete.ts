import { SpaceEntity } from "../../entities/SpaceEntity";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export interface DeleteSpaceDTO {
  id: string;
  owner_id: string; // To verify ownership
}

export class DeleteSpace {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(input: DeleteSpaceDTO): Promise<void> {
    const space = await this.spaceRepository.findById(input.id);

    if (!space) {
      throw new Error("Space not found");
    }

    // Verify ownership
    if (space.owner_id !== input.owner_id) {
      throw new Error("You are not authorized to delete this space");
    }

    await this.spaceRepository.delete(input.id);
  }
}
