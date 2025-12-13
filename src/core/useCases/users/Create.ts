import { IUser, UserIsActive, UserRole } from "../../../types/user";
import { CreateUserDTO } from "../../dtos/CreateUserDTO";
import { UserEntity } from "../../entities/UserEntity";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IHashService } from "../../services/IHashService";
import { IUuidGenerator } from "../../services/IUuidGenerator";

export class CreateUser {
  private readonly _userRepository: IUserRepository;
  private readonly _hashService: IHashService;
  private readonly _uuidGenerator: IUuidGenerator;

  constructor(
    userRepository: IUserRepository,
    hashService: IHashService,
    uuidGenerator: IUuidGenerator
  ) {
    this._userRepository = userRepository;
    this._hashService = hashService;
    this._uuidGenerator = uuidGenerator;
  }

  async execute(input: CreateUserDTO): Promise<void> {
    const existingUser = await this._userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error("email already exists");
    }

    let user: UserEntity;
    try {
      const userData: IUser = {
        id: this._uuidGenerator.generate(),
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
        role: input.role ?? UserRole.PROPRIETARIO,
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

    const hashedPassword = await this._hashService.hash(input.password);
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
