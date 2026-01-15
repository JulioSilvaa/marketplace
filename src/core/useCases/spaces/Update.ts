import { IAddress, spaceStatus } from "../../../types/Space";
import { ActivityEvent } from "../../entities/ActivityEvent";
import { SpaceEntity } from "../../entities/SpaceEntity";
import { IEventRepository } from "../../repositories/IEventRepository";
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
  specifications?: Record<string, any>;
  images?: string[];
  status?: spaceStatus;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_instagram?: string;
  contact_facebook?: string;
  contact_whatsapp_alternative?: string;
}

export class UpdateSpace {
  constructor(
    private spaceRepository: ISpaceRepository,
    private eventRepository: IEventRepository
  ) {}

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
      specifications: input.specifications ?? existingSpace.specifications,
      images: input.images ?? existingSpace.images,
      status: input.status ?? existingSpace.status,
      contact_whatsapp: input.contact_whatsapp ?? existingSpace.contact_whatsapp,
      contact_phone: input.contact_phone ?? existingSpace.contact_phone,
      contact_email: input.contact_email ?? existingSpace.contact_email,
      contact_instagram: input.contact_instagram ?? existingSpace.contact_instagram,
      contact_facebook: input.contact_facebook ?? existingSpace.contact_facebook,
      contact_whatsapp_alternative:
        input.contact_whatsapp_alternative ?? existingSpace.contact_whatsapp_alternative,
    });

    await this.spaceRepository.update(updatedSpace);

    // ACTIVITY LOGGING

    // 1. Status Change (Pause/Resume)
    if (input.status && input.status !== existingSpace.status) {
      await this.eventRepository.create({
        listing_id: existingSpace.id!,
        user_id: existingSpace.owner_id,
        event_type: "status_change",
        metadata: {
          oldStatus: existingSpace.status,
          newStatus: input.status,
        },
      });
    }

    // 2. Price Update
    const oldPrice = existingSpace.price_per_weekend || existingSpace.price_per_day;
    const newPrice = input.price_per_weekend || input.price_per_day;
    // Simple check: if prices input changed.
    const priceChanged =
      (input.price_per_day && input.price_per_day !== existingSpace.price_per_day) ||
      (input.price_per_weekend && input.price_per_weekend !== existingSpace.price_per_weekend);

    if (priceChanged) {
      // Calculate % change if applicable
      const pOld = oldPrice || 0;
      const pNew = newPrice || 0;
      let changePercent = 0;
      if (pOld > 0) changePercent = Math.round(((pNew - pOld) / pOld) * 100);

      await this.eventRepository.create({
        listing_id: existingSpace.id!,
        user_id: existingSpace.owner_id,
        event_type: "price_updated",
        metadata: {
          oldPrice: pOld,
          newPrice: pNew,
          priceChangePercent: changePercent,
        },
      });
    }

    // 3. Description/Title Update
    if (
      (input.description && input.description !== existingSpace.description) ||
      (input.title && input.title !== existingSpace.title)
    ) {
      await this.eventRepository.create({
        listing_id: existingSpace.id!,
        user_id: existingSpace.owner_id,
        event_type: "description_updated",
        metadata: {
          changedField: input.title !== existingSpace.title ? "title" : "description",
        },
      });
    }

    // 4. Photos Update
    if (input.images && JSON.stringify(input.images) !== JSON.stringify(existingSpace.images)) {
      const added = input.images.length > existingSpace.images.length;
      // Simple logic
      await this.eventRepository.create({
        listing_id: existingSpace.id!,
        user_id: existingSpace.owner_id,
        event_type: "photos_updated",
        metadata: {
          photoAction: added ? "added" : "removed", // or updated
          photoCount: input.images.length,
        },
      });
    }
  }
}
