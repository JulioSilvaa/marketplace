import { IUser } from "../../../types/user";
import { IUserRepository } from "../../repositories/userRepository";

export class FindByIdUser {
  private readonly _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async execute(id: string): Promise<IUser | null> {
    const user = await this._userRepository.findById(id);

    if (!user) {
      return null;
    }

    return user;
  }
}
