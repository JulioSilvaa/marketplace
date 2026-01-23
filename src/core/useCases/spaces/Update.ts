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
  type?: "SPACE" | "SERVICE" | "EQUIPMENT";
  price_unit?: string;
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
      type: input.type ?? existingSpace.type,
      price_unit: input.price_unit ?? existingSpace.price_unit,
    });

    await this.spaceRepository.update(updatedSpace);

    // ACTIVITY LOGGING

    // ACTIVITY LOGGING

    // 1. Status Change (Pause/Resume) - Keep separate as it's a distinct lifecycle event
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

    // 2. Photos Update - Keep separate logic
    if (input.images && JSON.stringify(input.images) !== JSON.stringify(existingSpace.images)) {
      const added = input.images.length > existingSpace.images.length;
      await this.eventRepository.create({
        listing_id: existingSpace.id!,
        user_id: existingSpace.owner_id,
        event_type: "photos_updated",
        metadata: {
          photoAction: added ? "added" : "removed",
          photoCount: input.images.length,
        },
      });
    }

    // 3. General Fields Update (Consolidated)
    const changedFields: string[] = [];

    // Basic Fields
    if (input.title && input.title !== existingSpace.title) changedFields.push("title");
    if (input.description && input.description !== existingSpace.description)
      changedFields.push("description");
    if (input.capacity && input.capacity !== existingSpace.capacity) changedFields.push("capacity");

    // Price
    const oldPrice = existingSpace.price_per_weekend || existingSpace.price_per_day;
    const newPrice = input.price_per_weekend || input.price_per_day;
    if (
      (input.price_per_day && input.price_per_day !== existingSpace.price_per_day) ||
      (input.price_per_weekend && input.price_per_weekend !== existingSpace.price_per_weekend)
    ) {
      changedFields.push("price");
      // Also fire legacy price_updated logic if needed, but listing_updated should suffice for "Recent Activity" list
      // If specific analytics depend on price_updated, we could keep it.
      // For now, consolidating into changedFields metadata seems cleaner for the user request "all fields".
    }

    // Address (Deep comparison or simple JSON stringify)
    if (input.address && JSON.stringify(input.address) !== JSON.stringify(existingSpace.address)) {
      changedFields.push("address");
    }

    // Amenities/Comfort
    if (
      input.comfort &&
      JSON.stringify(input.comfort.sort()) !== JSON.stringify(existingSpace.comfort.sort())
    ) {
      changedFields.push("comfort");
    }

    // Specifications
    if (
      input.specifications &&
      JSON.stringify(input.specifications) !== JSON.stringify(existingSpace.specifications)
    ) {
      changedFields.push("specifications");
    }

    // Contacts
    if (
      (input.contact_whatsapp && input.contact_whatsapp !== existingSpace.contact_whatsapp) ||
      (input.contact_phone && input.contact_phone !== existingSpace.contact_phone) ||
      (input.contact_email && input.contact_email !== existingSpace.contact_email) ||
      (input.contact_instagram && input.contact_instagram !== existingSpace.contact_instagram) ||
      (input.contact_facebook && input.contact_facebook !== existingSpace.contact_facebook) ||
      (input.contact_whatsapp_alternative &&
        input.contact_whatsapp_alternative !== existingSpace.contact_whatsapp_alternative)
    ) {
      changedFields.push("contact");
    }

    if (changedFields.length > 0) {
      await this.eventRepository.create({
        listing_id: existingSpace.id!,
        user_id: existingSpace.owner_id,
        event_type: "listing_updated",
        metadata: {
          changedFields: changedFields,
          totalChanges: changedFields.length,
        },
      });
    }
  }
}
