import { SpaceEntity } from "../../../../core/entities/SpaceEntity";
import { IAdminSpaceRepository } from "../../../../core/repositories/admin/IAdminSpaceRepository";
import { prisma } from "../../../../lib/prisma";
import { SpaceAdapter } from "../../../adapters/SpaceAdapter";

export class AdminSpaceRepository implements IAdminSpaceRepository {
  async list(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    ownerId?: string
  ): Promise<{ data: { space: SpaceEntity; owner: any; subscription?: any }[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (ownerId) where.owner_id = ownerId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
      // Note: Full unaccent support would require raw query like SpaceRepositoryPrisma, keeping it simple for now or copying raw query if needed.
      // For MVP Admin, simple ILIKE is often enough if unaccent extension not critical for admin names.
      // But unaccent is better. I'll use simple contains for speed now.
    }

    const [spaces, total] = await Promise.all([
      prisma.spaces.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          users: true,
          subscriptions: {
            take: 1,
            orderBy: { created_at: "desc" },
          },
        },
      }),
      prisma.spaces.count({ where }),
    ]);

    return {
      data: spaces.map(s => ({
        space: SpaceAdapter.toEntity(s),
        owner: s.users,
        subscription: (s as any).subscriptions?.[0], // Assuming subscriptions relation exists and is fetched
      })),

      total,
    };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await prisma.spaces.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    await prisma.spaces.update({
      where: { id },
      data: { status: "deleted" }, // or inactive
    });
  }
}
