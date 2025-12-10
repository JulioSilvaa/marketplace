import { UserEntity } from "../../core/entities/UserEntity";
import { IUser, UserIsActive, UserRole } from "../../types/user";

export class UserAdapter {
  static toDomain(data: any): IUser {
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

  static toEntity(data: any): UserEntity {
    return UserEntity.create(UserAdapter.toDomain(data));
  }
}
