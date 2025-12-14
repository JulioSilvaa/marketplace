import { UserAdapter } from "../../../infra/adapters/UserAdapter";
import { generateAccessToken, generateRefreshToken } from "../../../infra/services/GenerateTokens";
import { LoginDTO } from "../../dtos/LoginDTO";
import { LoginResponseDTO } from "../../dtos/LoginResponseDTO";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IHashService } from "../../services/IHashService";

export class LoginUser {
  private readonly _userRepository: IUserRepository;
  private readonly _hashService: IHashService;

  constructor(userRepository: IUserRepository, hashService: IHashService) {
    this._userRepository = userRepository;
    this._hashService = hashService;
  }

  async execute(input: LoginDTO): Promise<LoginResponseDTO> {
    // Buscar usuário por email
    const user = await this._userRepository.findByEmail(input.email);

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    // Verificar senha
    const isPasswordValid = await this._hashService.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }

    // Gerar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Converter usuário para DTO
    const userOutput = UserAdapter.toOutputDTO(user);

    return {
      accessToken,
      user: userOutput,
      refreshToken, // Controller extrairá isso para colocar no cookie
    } as LoginResponseDTO & { refreshToken: string };
  }
}
