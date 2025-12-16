import { IUserRepository } from "../../repositories/IUserRepository";

export interface DeleteUserDTO {
  id: string;
}

export class DeleteUser {
  private readonly _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async execute(input: DeleteUserDTO): Promise<void> {
    const user = await this._userRepository.findById(input.id);

    if (!user) {
      throw new Error("User not found");
    }

    await this._userRepository.delete(input.id);
  }
}
