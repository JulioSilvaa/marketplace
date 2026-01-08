import { IUserRepository } from "../../../core/repositories/IUserRepository";
import { prisma } from "../../../lib/prisma";
import { IUser } from "../../../types/user";
import { UserAdapter } from "../../adapters/UserAdapter";

export class UserRepositoryPrisma implements IUserRepository {
  async create(data: IUser): Promise<void> {
    await prisma.users.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: data.password,
        role: UserAdapter.toPrismaRole(data.role),
        checked: data.checked,
        status: UserAdapter.toPrismaStatus(data.status),
      },
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    if (!email) return null;
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) return null;

    return UserAdapter.toDomain(user);
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await prisma.users.findUnique({
      where: { id },
    });

    if (!user) return null;

    return UserAdapter.toDomain(user);
  }

  async update(id: string, data: Partial<IUser>): Promise<void> {
    const prismaData: any = { ...data };

    // Convert domain enums to Prisma enums if present
    if (data.role !== undefined) {
      prismaData.role = UserAdapter.toPrismaRole(data.role);
    }
    if (data.status !== undefined) {
      prismaData.status = UserAdapter.toPrismaStatus(data.status);
    }

    await prisma.users.update({
      where: { id },
      data: prismaData,
    });
  }

  async findAll(): Promise<IUser[]> {
    const users = await prisma.users.findMany();
    return users.map(user => UserAdapter.toDomain(user));
  }

  async search(filters: { name?: string; email?: string; isActive?: boolean }): Promise<IUser[]> {
    const where: any = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters.email) {
      where.email = {
        contains: filters.email,
        mode: "insensitive",
      };
    }

    if (filters.isActive !== undefined) {
      where.status = filters.isActive ? "active" : "inactive";
    }

    const users = await prisma.users.findMany({
      where,
    });

    return users.map(user => UserAdapter.toDomain(user));
  }

  async delete(id: string): Promise<void> {
    await prisma.users.delete({
      where: { id },
    });
  }
}
