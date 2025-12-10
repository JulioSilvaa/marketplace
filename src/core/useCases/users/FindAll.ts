import { IUser } from "../../../types/user";
import { IUserRepository } from "../../repositories/IUserRepository";

export class FindAllUsers {
  private readonly _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async execute(): Promise<IUser[]> {
    const users = await this._userRepository.findAll();
    return users;
  }
}
