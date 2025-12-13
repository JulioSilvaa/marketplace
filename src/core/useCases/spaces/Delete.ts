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

    // Soft delete by creating new entity with inactive status
    const inactiveSpace = SpaceEntity.create({
      id: space.id!,
      owner_id: space.owner_id,
      title: space.title,
      description: space.description,
      address: space.address,
      capacity: space.capacity,
      price_per_weekend: space.price_per_weekend,
      price_per_day: space.price_per_day,
      comfort: space.comfort,
      images: space.images,
      status: "inactive",
    });

    await this.spaceRepository.update(inactiveSpace);
  }
}
