import { users } from "../../../generated/prisma/client";
import { UserListOutputDTO } from "../../core/dtos/UserListOutputDTO";
import { UserOutputDTO } from "../../core/dtos/UserOutputDTO";
import { UserEntity } from "../../core/entities/UserEntity";
import { IUser, UserIsActive, UserRole } from "../../types/user";

export class UserAdapter {
  // Convert domain numeric role to Prisma string role
  static toPrismaRole(role: UserRole): "user" | "admin" {
    return role === UserRole.CLIENTE ? "user" : "admin";
  }

  // Convert Prisma string role to domain numeric role
  static fromPrismaRole(role: string): UserRole {
    return role === "user" ? UserRole.CLIENTE : UserRole.PROPRIETARIO;
  }

  // Convert domain numeric status to Prisma string status
  static toPrismaStatus(status: UserIsActive): "active" | "inactive" {
    return status === UserIsActive.ATIVO ? "active" : "inactive";
  }

  // Convert Prisma string status to domain numeric status
  static fromPrismaStatus(status: string): UserIsActive {
    return status === "active" ? UserIsActive.ATIVO : UserIsActive.INATIVO;
  }

  static toDomain(data: users): IUser {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: UserAdapter.fromPrismaRole(data.role),
      checked: data.checked,
      status: UserAdapter.fromPrismaStatus(data.status),

      created_at: data.created_at,
      updated_at: data.updated_at,
      region: (data as any).spaces?.[0]
        ? `${(data as any).spaces[0].city} - ${(data as any).spaces[0].state}`
        : undefined,
    };
  }

  static toEntity(data: users): UserEntity {
    return UserEntity.create(UserAdapter.toDomain(data));
  }

  static toOutputDTO(user: IUser): UserOutputDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role === UserRole.PROPRIETARIO ? "owner" : "client",
      checked: user.checked,
      status: user.status === UserIsActive.ATIVO ? "active" : "inactive",
      region: user.region,

      created_at: user.created_at?.toISOString(),
      updated_at: user.updated_at?.toISOString(),
      // password is intentionally excluded
    };
  }

  static toListOutputDTO(users: IUser[]): UserListOutputDTO {
    return {
      data: users.map(user => this.toOutputDTO(user)),
      total: users.length,
    };
  }
}
