import { users } from "../../../generated/prisma/client";
import { UserListOutputDTO } from "../../core/dtos/UserListOutputDTO";
import { UserOutputDTO } from "../../core/dtos/UserOutputDTO";
import { UserEntity } from "../../core/entities/UserEntity";
import { IUser, UserIsActive, UserRole } from "../../types/user";

export class UserAdapter {
  static toDomain(data: users): IUser {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role as UserRole,
      checked: data.checked,
      status: data.status as UserIsActive,
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
      role: user.role,
      checked: user.checked,
      status: user.status,
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
