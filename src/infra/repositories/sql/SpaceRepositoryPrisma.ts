import { spaces } from "../../../../generated/prisma/client";
import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { ISpaceRepository } from "../../../core/repositories/ISpaceRepository";
import { prisma } from "../../../lib/prisma";
import { SpaceAdapter } from "../../adapters/SpaceAdapter";

export class SpaceRepositoryPrisma implements ISpaceRepository {
  async create(space: SpaceEntity): Promise<SpaceEntity> {
    await prisma.spaces.create({
      data: {
        id: space.id!,
        owner_id: space.owner_id!,
        title: space.title,
        description: space.description,
        capacity: space.capacity,
        price_per_weekend: space.price_per_weekend,
        price_per_day: space.price_per_day,
        comfort: space.comfort,
        images: space.images,
        status: space.status,
        street: space.address.street,
        number: space.address.number,
        complement: space.address.complement,
        neighborhood: space.address.neighborhood,
        city: space.address.city,
        state: space.address.state,
        zipcode: space.address.zipcode,
        country: space.address.country,
      },
    });
    return SpaceAdapter.toEntity({
      id: space.id!,
      owner_id: space.owner_id!,
      title: space.title,
      description: space.description,
      capacity: space.capacity,
      price_per_weekend: space.price_per_weekend,
      price_per_day: space.price_per_day,
      comfort: space.comfort,
      images: space.images,
      status: space.status,
      street: space.address.street,
      number: space.address.number,
      complement: space.address.complement,
      neighborhood: space.address.neighborhood,
      city: space.address.city,
      state: space.address.state,
      zipcode: space.address.zipcode,
      country: space.address.country,
    } as spaces);
  }

  async findById(id: string): Promise<SpaceEntity | null> {
    const spaceData = await prisma.spaces.findUnique({
      where: { id },
    });

    if (!spaceData) return null;

    return SpaceAdapter.toEntity(spaceData);
  }

  async listByOwnerId(ownerId: string): Promise<SpaceEntity[]> {
    const spacesData = await prisma.spaces.findMany({
      where: { owner_id: ownerId },
    });

    return spacesData.map(s => SpaceAdapter.toEntity(s));
  }
}
