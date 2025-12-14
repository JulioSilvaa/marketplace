import { ResetPasswordDTO } from "../../dtos/ResetPasswordDTO";
import { IPasswordResetTokenRepository } from "../../repositories/IPasswordResetTokenRepository";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IHashService } from "../../services/IHashService";

export class ResetPassword {
  private readonly _userRepository: IUserRepository;
  private readonly _resetTokenRepository: IPasswordResetTokenRepository;
  private readonly _hashService: IHashService;

  constructor(
    userRepository: IUserRepository,
    resetTokenRepository: IPasswordResetTokenRepository,
    hashService: IHashService
  ) {
    this._userRepository = userRepository;
    this._resetTokenRepository = resetTokenRepository;
    this._hashService = hashService;
  }

  async execute(input: ResetPasswordDTO): Promise<{ message: string }> {
    // Validar entrada
    if (!input.token || !input.newPassword) {
      throw new Error("Token e nova senha são obrigatórios");
    }

    // Validar força da senha
    if (input.newPassword.length < 6) {
      throw new Error("A senha deve ter no mínimo 6 caracteres");
    }

    // Buscar token
    const resetToken = await this._resetTokenRepository.findByToken(input.token);

    if (!resetToken) {
      throw new Error("Token inválido ou expirado");
    }

    // Verificar se token já foi usado
    if (resetToken.used) {
      throw new Error("Token já foi utilizado");
    }

    // Verificar se token expirou
    if (new Date() > resetToken.expires_at) {
      throw new Error("Token expirado");
    }

    // Hash da nova senha
    const hashedPassword = await this._hashService.hash(input.newPassword);

    // Atualizar senha do usuário
    await this._userRepository.update(resetToken.user_id, {
      password: hashedPassword,
    });

    // Marcar token como usado
    await this._resetTokenRepository.markAsUsed(resetToken.id);

    return {
      message: "Senha redefinida com sucesso",
    };
  }
}
