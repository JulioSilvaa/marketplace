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
        category_id: space.category_id,
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
        contact_whatsapp: space.contact_whatsapp,
        contact_phone: space.contact_phone,
        contact_email: space.contact_email,
        contact_instagram: space.contact_instagram,
        contact_facebook: space.contact_facebook,
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
      created_at: new Date(),
      updated_at: new Date(),
      street: space.address.street,
      number: space.address.number,
      complement: space.address.complement,
      neighborhood: space.address.neighborhood,
      city: space.address.city,
      state: space.address.state,
      zipcode: space.address.zipcode,
      country: space.address.country,
      contact_whatsapp: space.contact_whatsapp,
      contact_phone: space.contact_phone,
      contact_email: space.contact_email,
      contact_instagram: space.contact_instagram,
      contact_facebook: space.contact_facebook,
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

  async listByOwnerIdWithMetrics(
    ownerId: string
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithMetrics[]> {
    const spacesData = await prisma.spaces.findMany({
      where: { owner_id: ownerId },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (spacesData.length === 0) return [];

    const spaceIds = spacesData.map(s => s.id);

    // Get metrics for all these spaces at once
    const metrics = await prisma.activity_events.groupBy({
      by: ["listing_id", "event_type"],
      where: {
        listing_id: { in: spaceIds },
        event_type: { in: ["view", "contact_whatsapp", "contact_phone"] },
      },
      _count: true,
    });

    return spacesData.map(space => {
      const spaceMetrics = metrics.filter(m => m.listing_id === space.id);
      const views = spaceMetrics.find(m => m.event_type === "view")?._count || 0;
      const whatsapp = spaceMetrics.find(m => m.event_type === "contact_whatsapp")?._count || 0;
      const phone = spaceMetrics.find(m => m.event_type === "contact_phone")?._count || 0;

      const ratings = space.reviews.map(r => r.rating);
      const average_rating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : null;

      return {
        space: SpaceAdapter.toEntity(space),
        average_rating,
        reviews_count: ratings.length,
        views_count: views,
        contacts_count: whatsapp + phone,
      };
    });
  }

  async findAll(): Promise<SpaceEntity[]> {
    const spacesData = await prisma.spaces.findMany({
      where: {
        status: "active",
        users: {
          status: "active",
        },
      },
    });
    return spacesData.map(s => SpaceAdapter.toEntity(s));
  }

  async update(space: SpaceEntity): Promise<void> {
    await prisma.spaces.update({
      where: { id: space.id },
      data: {
        category_id: space.category_id,
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
        contact_whatsapp: space.contact_whatsapp,
        contact_phone: space.contact_phone,
        contact_email: space.contact_email,
        contact_instagram: space.contact_instagram,
        contact_facebook: space.contact_facebook,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.spaces.delete({
      where: { id },
    });
  }

  async findByIdWithRating(
    id: string
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithRating | null> {
    const spaceData = await prisma.spaces.findUnique({
      where: { id },
      include: {
        users: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!spaceData) return null;

    const ratings = spaceData.reviews.map(r => r.rating);
    const average_rating =
      ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;

    return {
      space: SpaceAdapter.toEntity(spaceData),
      average_rating,
      reviews_count: ratings.length,
      owner: spaceData.users,
    };
  }

  async findAllWithRatings(
    filters?: import("../../../core/repositories/ISpaceRepository").SpaceFilters
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithRating[]> {
    let spaceIds: string[] | undefined = undefined;

    // Se houver filtros de texto (cidade, estado, bairro ou busca), usamos raw SQL para tratar acentos
    if (filters?.city || filters?.state || filters?.neighborhood || filters?.search) {
      let query = "SELECT id FROM spaces WHERE status = 'active'";
      const params: any[] = [];

      if (filters.city) {
        query += ` AND unaccent(city) ILIKE unaccent($${params.length + 1})`;
        params.push(`%${filters.city}%`);
      }

      if (filters.state) {
        query += ` AND unaccent(state) ILIKE unaccent($${params.length + 1})`;
        params.push(`%${filters.state}%`);
      }

      if (filters.neighborhood) {
        query += ` AND unaccent(neighborhood) ILIKE unaccent($${params.length + 1})`;
        params.push(`%${filters.neighborhood}%`);
      }

      if (filters.search) {
        query += ` AND (unaccent(title) ILIKE unaccent($${params.length + 1}) 
                    OR unaccent(description) ILIKE unaccent($${params.length + 1})
                    OR unaccent(neighborhood) ILIKE unaccent($${params.length + 1}))`;
        params.push(`%${filters.search}%`);
      }

      const results = await prisma.$queryRawUnsafe<{ id: string }[]>(query, ...params);
      spaceIds = results.map(r => r.id);

      // Se não houver resultados no filtro de texto, retornamos lista vazia imediatamente
      if (spaceIds.length === 0) return [];
    }

    const spacesData = await prisma.spaces.findMany({
      where: {
        id: spaceIds ? { in: spaceIds } : undefined,
        status: "active",
        category_id: filters?.category_id,
        price_per_day:
          filters?.price_min !== undefined || filters?.price_max !== undefined
            ? {
                gte: filters?.price_min,
                lte: filters?.price_max,
              }
            : undefined,
        users: {
          status: "active",
        },
      },
      take: filters?.limit,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    return spacesData.map((spaceData: any) => {
      const ratings = spaceData.reviews.map((r: any) => r.rating);
      const average_rating =
        ratings.length > 0
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
          : null;

      return {
        space: SpaceAdapter.toEntity(spaceData),
        average_rating,
        reviews_count: ratings.length,
      };
    });
  }
}
