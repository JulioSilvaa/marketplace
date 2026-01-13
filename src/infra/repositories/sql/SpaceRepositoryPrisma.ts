import { spaces } from "@prisma/client";

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
        capacity: space.capacity ?? null,
        price_per_weekend: space.price_per_weekend,
        price_per_day: space.price_per_day,
        comfort: space.comfort,
        specifications: space.specifications ?? undefined,
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
        contact_whatsapp_alternative: space.contact_whatsapp_alternative,
      },
    });
    return SpaceAdapter.toEntity({
      id: space.id!,
      owner_id: space.owner_id!,
      category_id: space.category_id || null, // Ensure category_id is passed
      title: space.title,
      description: space.description,
      capacity: space.capacity ?? null, // Prisma expects null for optional
      price_per_weekend: space.price_per_weekend ?? null,
      price_per_day: space.price_per_day ?? null,
      comfort: space.comfort,
      specifications: space.specifications ?? null,
      images: space.images,
      status: space.status,
      created_at: new Date(),
      updated_at: new Date(),
      street: space.address.street,
      number: space.address.number,
      complement: space.address.complement ?? null,
      neighborhood: space.address.neighborhood,
      city: space.address.city,
      state: space.address.state,
      zipcode: space.address.zipcode,
      country: space.address.country,
      contact_whatsapp: space.contact_whatsapp ?? null,
      contact_phone: space.contact_phone ?? null,
      contact_email: space.contact_email ?? null,
      contact_instagram: space.contact_instagram ?? null,
      contact_facebook: space.contact_facebook ?? null,
      contact_whatsapp_alternative: space.contact_whatsapp_alternative ?? null,
    } as spaces);
  }

  async findById(id: string): Promise<SpaceEntity | null> {
    const spaceData = await prisma.spaces.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!spaceData) return null;

    return SpaceAdapter.toEntity(spaceData);
  }

  async listByOwnerId(ownerId: string): Promise<SpaceEntity[]> {
    const spacesData = await prisma.spaces.findMany({
      where: {
        owner_id: ownerId,
        status: { not: "deleted" },
      },
    });

    return spacesData.map(s => SpaceAdapter.toEntity(s));
  }

  async listByOwnerIdWithMetrics(
    ownerId: string
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithMetrics[]> {
    const spacesData = await prisma.spaces.findMany({
      where: {
        owner_id: ownerId,
        status: { not: "deleted" }, // Exclude deleted spaces
      },
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

  async count(
    filters?: import("../../../core/repositories/ISpaceRepository").SpaceFilters
  ): Promise<number> {
    let spaceIds: string[] | undefined = undefined;

    // Reuse text filtering logic
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
                    OR unaccent(city) ILIKE unaccent($${params.length + 1})
                    OR unaccent(state) ILIKE unaccent($${params.length + 1})
                    OR unaccent(neighborhood) ILIKE unaccent($${params.length + 1}))`;
        params.push(`%${filters.search}%`);
      }

      const results = await prisma.$queryRawUnsafe<{ id: string }[]>(query, ...params);
      spaceIds = results.map(r => r.id);

      if (spaceIds.length === 0) return 0;
    }

    const count = await prisma.spaces.count({
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
    });

    return count;
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
        specifications: space.specifications ?? undefined,
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
        contact_whatsapp_alternative: space.contact_whatsapp_alternative,
      },
    });
  }

  async updateStatus(id: string, status: "active" | "inactive" | "suspended"): Promise<void> {
    await prisma.spaces.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.spaces.update({
      where: { id },
      data: { status: "deleted" },
    });
  }

  async findByIdWithRating(
    id: string
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithRating | null> {
    const spaceData = await prisma.spaces.findUnique({
      where: { id },
      include: {
        category: true,
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

  async search(
    filters?: import("../../../core/repositories/ISpaceRepository").SpaceFilters
  ): Promise<{
    data: import("../../../core/repositories/ISpaceRepository").SpaceWithRating[];
    total: number;
  }> {
    // Base params
    const params: any[] = [];

    // Base query: Join with users to check owner status immediately
    let query = `
      SELECT s.id 
      FROM spaces s
      INNER JOIN users u ON s.owner_id = u.id
      WHERE s.status = 'active' 
      AND u.status = 'active'
    `;

    // 1. Text Filters (Unaccent)
    if (filters?.city) {
      query += ` AND unaccent(s.city) ILIKE unaccent($${params.length + 1})`;
      params.push(`%${filters.city}%`);
    }

    if (filters?.state) {
      query += ` AND unaccent(s.state) ILIKE unaccent($${params.length + 1})`;
      params.push(`%${filters.state}%`);
    }

    if (filters?.neighborhood) {
      query += ` AND unaccent(s.neighborhood) ILIKE unaccent($${params.length + 1})`;
      params.push(`%${filters.neighborhood}%`);
    }

    if (filters?.search) {
      query += ` AND (unaccent(s.title) ILIKE unaccent($${params.length + 1}) 
                  OR unaccent(s.description) ILIKE unaccent($${params.length + 1})
                  OR unaccent(s.city) ILIKE unaccent($${params.length + 1})
                  OR unaccent(s.state) ILIKE unaccent($${params.length + 1})
                  OR unaccent(s.neighborhood) ILIKE unaccent($${params.length + 1}))`;
      params.push(`%${filters.search}%`);
    }

    // 2. Exact Filters (Category)
    if (filters?.category_id) {
      query += ` AND s.category_id = $${params.length + 1}`;
      params.push(filters.category_id);
    }

    // 3. Range Filters (Price)
    // Note: We check both price_per_day and price_per_weekend vs the filter per requirement logic
    // Usually user filters "Price Min" means "Is there any price method >= Min?"
    // Current Prisma implementation checked 'price_per_day'. We stick to that for consistency,
    // or expand if needed. The previous implementation checked ONLY price_per_day inside the Prisma 'where'.
    // "price_per_day: { gte: ... }"
    // So we replicate that behavior.
    if (filters?.price_min !== undefined) {
      query += ` AND s.price_per_day >= $${params.length + 1}`;
      params.push(filters.price_min);
    }

    if (filters?.price_max !== undefined) {
      query += ` AND s.price_per_day <= $${params.length + 1}`;
      params.push(filters.price_max);
    }

    // 4. Ordering
    // We must ensure stable ordering for slice to work
    query += ` ORDER BY s.created_at DESC`;

    // Execute Query
    const results = await prisma.$queryRawUnsafe<{ id: string }[]>(query, ...params);
    const allIds = results.map(r => r.id);
    const total = allIds.length;

    if (total === 0) {
      return { data: [], total: 0 };
    }

    // 5. Pagination in Memory (Slicing IDs)
    // This avoids passing 10k IDs to Prisma
    const limit = filters?.limit || 100; // Default fallback matches controller
    const offset = filters?.offset || 0;

    // Safety check for offset
    if (offset >= total) {
      return { data: [], total };
    }

    const pageIds = allIds.slice(offset, offset + limit);

    // 6. Fetch Full Data for Page
    // We already sorted IDs, but findMany(IN) doesn't guarantee order.
    // We re-apply orderBy created_at to ensure the PAGE is sorted correctly.
    // Since pageIds represents a contiguous block of sorted items,
    // sorting them again by the same key yields the correct visual order.
    const spacesData = await prisma.spaces.findMany({
      where: {
        id: { in: pageIds },
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const data = spacesData.map((spaceData: any) => {
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

    return { data, total };
  }

  async findAllWithRatings(
    filters?: import("../../../core/repositories/ISpaceRepository").SpaceFilters
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithRating[]> {
    const { data } = await this.search(filters);
    return data;
  }
}
