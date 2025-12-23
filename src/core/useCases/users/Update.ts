import { IUser } from "../../../types/user";
import { IUserRepository } from "../../repositories/IUserRepository";

export interface UpdateUserDTO {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: number;
  status?: number;
  whatsapp?: string;
  facebook_url?: string;
  instagram_url?: string;
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
    if (input.whatsapp !== undefined) updateData.whatsapp = input.whatsapp;
    if (input.facebook_url !== undefined) updateData.facebook_url = input.facebook_url;
    if (input.instagram_url !== undefined) updateData.instagram_url = input.instagram_url;

    await this._userRepository.update(input.id, updateData);
  }
}
