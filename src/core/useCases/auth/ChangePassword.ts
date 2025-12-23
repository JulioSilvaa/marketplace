import { ChangePasswordDTO } from "../../dtos/ChangePasswordDTO";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IHashService } from "../../services/IHashService";

export class ChangePassword {
  private readonly _userRepository: IUserRepository;
  private readonly _hashService: IHashService;

  constructor(userRepository: IUserRepository, hashService: IHashService) {
    this._userRepository = userRepository;
    this._hashService = hashService;
  }

  async execute(userId: string, input: ChangePasswordDTO): Promise<{ message: string }> {
    // Validar entrada
    if (!input.currentPassword || !input.newPassword) {
      throw new Error("Senha atual e nova senha são obrigatórias");
    }

    // Validar força da nova senha
    if (input.newPassword.length < 6) {
      throw new Error("A nova senha deve ter no mínimo 6 caracteres");
    }

    // Buscar usuário
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar senha atual
    const isPasswordValid = await this._hashService.compare(input.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error("Senha atual incorreta");
    }

    // Hash da nova senha
    const hashedPassword = await this._hashService.hash(input.newPassword);

    // Atualizar senha do usuário
    await this._userRepository.update(userId, {
      password: hashedPassword,
    });

    return {
      message: "Senha alterada com sucesso",
    };
  }
}
