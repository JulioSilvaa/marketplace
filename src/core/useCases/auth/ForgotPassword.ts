import { randomBytes } from "crypto";

import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";
import { ForgotPasswordDTO } from "../../dtos/ForgotPasswordDTO";
import { IPasswordResetTokenRepository } from "../../repositories/IPasswordResetTokenRepository";
import { IUserRepository } from "../../repositories/IUserRepository";

export class ForgotPassword {
  private readonly _userRepository: IUserRepository;
  private readonly _resetTokenRepository: IPasswordResetTokenRepository;
  private readonly _uuidGenerator: CryptoUuidGenerator;

  constructor(
    userRepository: IUserRepository,
    resetTokenRepository: IPasswordResetTokenRepository
  ) {
    this._userRepository = userRepository;
    this._resetTokenRepository = resetTokenRepository;
    this._uuidGenerator = new CryptoUuidGenerator();
  }

  async execute(input: ForgotPasswordDTO): Promise<{ message: string; token?: string }> {
    // Validar email
    if (!input.email || !input.email.includes("@")) {
      throw new Error("Email inválido");
    }

    // Buscar usuário por email
    const user = await this._userRepository.findByEmail(input.email);

    // Por segurança, sempre retornar sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!user) {
      return {
        message: "Se o email existir, você receberá instruções para redefinir sua senha",
      };
    }

    // Gerar token aleatório seguro
    const token = randomBytes(32).toString("hex");

    // Definir expiração para 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Armazenar token no banco
    await this._resetTokenRepository.create({
      id: this._uuidGenerator.generate(),
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    // TODO: Enviar email com link de reset
    // Por enquanto, retornar o token para testes
    return {
      message: "Se o email existir, você receberá instruções para redefinir sua senha",
      token, // Remover em produção - apenas para testes
    };
  }
}
