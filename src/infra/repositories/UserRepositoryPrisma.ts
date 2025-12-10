import { IUserRepository } from "../../core/repositories/userRepository";
import { prisma } from "../../lib/prisma";
import { IUser } from "../../types/user";
import { UserAdapter } from "../adapters/UserAdapter";

export class UserRepositoryPrisma implements IUserRepository {
  async create(data: IUser): Promise<void> {
    await prisma.users.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: data.password,
        role: data.role,
        checked: data.checked,
        status: data.status,
      },
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
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
    await prisma.users.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.users.delete({
      where: { id },
    });
  }
}
