import { IAdminCustomerRepository } from "../../../../core/repositories/admin/IAdminCustomerRepository";
import { prisma } from "../../../../lib/prisma";
import { IUser } from "../../../../types/user";
import { UserAdapter } from "../../../adapters/UserAdapter";

export class AdminCustomerRepository implements IAdminCustomerRepository {
  async list(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          spaces: {
            select: {
              id: true,
              title: true,
              status: true,
              city: true,
              state: true,
            },
          },
          subscriptions: {
            take: 1,
            orderBy: { created_at: "desc" },
            select: {
              plan: true,
              price: true,
              status: true,
            },
          },
        },
      }),
      prisma.users.count({ where }),
    ]);

    return {
      data: users.map(u => UserAdapter.toDomain(u)),
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.users.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const prismaStatus = UserAdapter.toPrismaStatus(status as any);
    await prisma.users.update({
      where: { id },
      data: { status: prismaStatus },
    });
  }
}
