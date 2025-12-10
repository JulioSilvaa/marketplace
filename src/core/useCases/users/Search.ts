import { IUser } from "../../../types/user";
import { SearchUserDTO } from "../../dtos/SearchUserDTO";
import { IUserRepository } from "../../repositories/userRepository";

export class SearchUser {
  private readonly _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async execute(filters: SearchUserDTO): Promise<IUser[]> {
    const users = await this._userRepository.search(filters);
    return users;
  }
}
