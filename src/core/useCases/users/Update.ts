import { IUser } from "../../../types/user";
import { IUserRepository } from "../../repositories/IUserRepository";

export interface UpdateUserDTO {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: number;
  status?: number;
}

export class UpdateUser {
  private readonly _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async execute(input: UpdateUserDTO): Promise<void> {
    const user = await this._userRepository.findById(input.id);

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: Partial<IUser> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.status !== undefined) updateData.status = input.status;

    await this._userRepository.update(input.id, updateData);
  }
}
