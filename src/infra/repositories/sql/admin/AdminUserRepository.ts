import {
  AdminUser,
  IAdminUserRepository,
} from "../../../../core/repositories/admin/IAdminUserRepository";
import { prisma } from "../../../../lib/prisma";

export class AdminUserRepository implements IAdminUserRepository {
  async findByEmail(email: string): Promise<AdminUser | null> {
    const admin = await prisma.admin_users.findUnique({
      where: { email },
    });
    return admin;
  }

  async findById(id: string): Promise<AdminUser | null> {
    const admin = await prisma.admin_users.findUnique({
      where: { id },
    });
    return admin;
  }

  async create(
    data: Omit<AdminUser, "id" | "created_at" | "updated_at" | "last_login_at">
  ): Promise<AdminUser> {
    const admin = await prisma.admin_users.create({
      data: {
        ...data,
      },
    });
    return admin;
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.admin_users.update({
      where: { id },
      data: { last_login_at: new Date() },
    });
  }
}
