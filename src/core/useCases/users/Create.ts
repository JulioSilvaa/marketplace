import bcrypt from "bcryptjs";
import crypto from "crypto";

import { IUser, UserIsActive, UserRole } from "../../../types/user";
import { CreateUserDTO } from "../../dtos/CreateUserDTO";
import { UserEntity } from "../../entities/UserEntity";
import { IUserRepository } from "../../repositories/userRepository";

export class CreateUser {
  private readonly _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async execute(input: CreateUserDTO): Promise<void> {
    const existingUser = await this._userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error("email already exists");
    }

    let user: UserEntity;
    try {
      const userData: IUser = {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
        role: input.role ?? UserRole.CLIENTE,
        checked: false,
        status: UserIsActive.ATIVO, // Default status
      };

      user = UserEntity.create(userData);
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        throw new Error(error.message);
      }
      throw error;
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    user.setPassword(hashedPassword);

    await this._userRepository.create({
      id: user.id!,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      checked: user.checked,
      password: user.password,
      status: user.status,
    });
  }
}
