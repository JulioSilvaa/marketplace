import { IAddress, spaceStatus } from "../../../types/Space";
import { SpaceEntity } from "../../entities/SpaceEntity";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export interface UpdateSpaceDTO {
  id: string;
  owner_id: string; // To verify ownership
  title?: string;
  description?: string;
  address?: IAddress;
  capacity?: number;
  price_per_weekend?: number;
  price_per_day?: number;
  comfort?: string[];
  images?: string[];
  status?: spaceStatus;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_instagram?: string;
  contact_facebook?: string;
}

export class UpdateSpace {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(input: UpdateSpaceDTO): Promise<void> {
    const existingSpace = await this.spaceRepository.findById(input.id);

    if (!existingSpace) {
      throw new Error("Space not found");
    }

    // Verify ownership
    if (existingSpace.owner_id !== input.owner_id) {
      throw new Error("You are not authorized to update this space");
    }

    // Create new entity with updated values (since properties are readonly)
    const updatedSpace = SpaceEntity.create({
      id: existingSpace.id!,
      owner_id: existingSpace.owner_id,
      title: input.title ?? existingSpace.title,
      description: input.description ?? existingSpace.description,
      address: input.address ?? existingSpace.address,
      capacity: input.capacity ?? existingSpace.capacity,
      price_per_weekend: input.price_per_weekend ?? existingSpace.price_per_weekend,
      price_per_day: input.price_per_day ?? existingSpace.price_per_day,
      comfort: input.comfort ?? existingSpace.comfort,
      images: input.images ?? existingSpace.images,
      status: input.status ?? existingSpace.status,
      contact_whatsapp: input.contact_whatsapp ?? existingSpace.contact_whatsapp,
      contact_phone: input.contact_phone ?? existingSpace.contact_phone,
      contact_email: input.contact_email ?? existingSpace.contact_email,
      contact_instagram: input.contact_instagram ?? existingSpace.contact_instagram,
      contact_facebook: input.contact_facebook ?? existingSpace.contact_facebook,
    });

    await this.spaceRepository.update(updatedSpace);
  }
}
