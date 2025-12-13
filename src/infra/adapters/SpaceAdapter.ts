import { spaces } from "../../../generated/prisma/client";
import { SpaceListOutputDTO } from "../../core/dtos/SpaceListOutputDTO";
import { SpaceOutputDTO } from "../../core/dtos/SpaceOutputDTO";
import { SpaceEntity } from "../../core/entities/SpaceEntity";
import { IAddress, spaceStatus } from "../../types/Space";

export class SpaceAdapter {
  static toEntity(data: spaces): SpaceEntity {
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

  static toOutputDTO(space: SpaceEntity): SpaceOutputDTO {
    return {
      id: space.id!,
      owner_id: space.owner_id!,
      title: space.title,
      description: space.description,
      address: space.address,
      capacity: space.capacity,
      price_per_weekend: space.price_per_weekend,
      price_per_day: space.price_per_day,
      comfort: space.comfort,
      images: space.images,
      status: space.status,
    };
  }

  static toListOutputDTO(spaces: SpaceEntity[]): SpaceListOutputDTO {
    return {
      data: spaces.map(space => this.toOutputDTO(space)),
      total: spaces.length,
    };
  }
}
