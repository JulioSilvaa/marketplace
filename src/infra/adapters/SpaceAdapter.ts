import { Space } from "@prisma/client";

import { SpaceEntity } from "../../core/entities/SpaceEntity";
import { IAddress, spaceStatus } from "../../types/Space";

export class SpaceAdapter {
  static toEntity(data: Space): SpaceEntity {
    const address: IAddress = {
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipcode: data.zipcode,
      country: data.country,
    };

    return SpaceEntity.create({
      id: data.id,
      owner_id: data.owner_id,
      title: data.title,
      description: data.description,
      capacity: data.capacity,
      price_per_weekend: data.price_per_weekend || undefined,
      price_per_day: data.price_per_day || undefined,
      comfort: data.comfort,
      images: data.images,
      status: data.status as spaceStatus,
      address,
    });
  }
}
