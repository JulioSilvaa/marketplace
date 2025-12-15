import { randomBytes } from "crypto";

import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";
import { ForgotPasswordDTO } from "../../dtos/ForgotPasswordDTO";
import { IPasswordResetTokenRepository } from "../../repositories/IPasswordResetTokenRepository";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IEmailService } from "../../services/IEmailService";

export class ForgotPassword {
  private readonly _userRepository: IUserRepository;
  private readonly _resetTokenRepository: IPasswordResetTokenRepository;
  private readonly _emailService: IEmailService;
  private readonly _uuidGenerator: CryptoUuidGenerator;

  constructor(
    userRepository: IUserRepository,
    resetTokenRepository: IPasswordResetTokenRepository,
    emailService: IEmailService
  ) {
    this._userRepository = userRepository;
    this._resetTokenRepository = resetTokenRepository;
    this._emailService = emailService;
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

    // Gerar link de reset
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Enviar email com link de reset
    try {
      await this._emailService.sendPasswordResetEmail(user.email, resetLink, user.name);
    } catch (error) {
      console.error("Erro ao enviar email de reset:", error);
      // Não revelar erro de email ao usuário por segurança
    }

    // Retornar sucesso (sem token no response em produção)
    const response: { message: string; token?: string } = {
      message: "Se o email existir, você receberá instruções para redefinir sua senha",
    };

    // Apenas para desenvolvimento e testes: retornar token para facilitar testes
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      response.token = token;
    }

    return response;
  }
}
