/// <reference path="../../../@types/express/index.d.ts" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ForgotPassword } from "../../../core/useCases/auth/ForgotPassword";
import { IUserRepository } from "../../../core/repositories/IUserRepository";
import { IPasswordResetTokenRepository } from "../../../core/repositories/IPasswordResetTokenRepository";
import { IUser, UserRole, UserIsActive } from "../../../types/user";
import { IEmailService } from "../../../core/services/IEmailService";

describe("ForgotPassword", () => {
  let forgotPassword: ForgotPassword;
  let mockUserRepository: IUserRepository;
  let mockResetTokenRepository: IPasswordResetTokenRepository;
  let mockEmailService: IEmailService;

  beforeEach(() => {
    // Mock do repositório de usuários
    mockUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      search: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Mock do repositório de tokens de reset
    mockResetTokenRepository = {
      create: vi.fn(),
      findByToken: vi.fn(),
      markAsUsed: vi.fn(),
      deleteExpired: vi.fn(),
    };

    // Mock do serviço de email
    mockEmailService = {
      sendPasswordResetEmail: vi.fn(),
    };

    forgotPassword = new ForgotPassword(
      mockUserRepository,
      mockResetTokenRepository,
      mockEmailService
    );
  });

  it("deve gerar token para email válido", async () => {
    const mockUser: IUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      password: "hashedpassword",
      phone: "1234567890",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockResetTokenRepository.create).mockResolvedValue({
      id: "token-123",
      user_id: mockUser.id,
      token: "generated-token",
      expires_at: new Date(),
      used: false,
      created_at: new Date(),
    });

    const result = await forgotPassword.execute({ email: "test@example.com" });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockResetTokenRepository.create).toHaveBeenCalled();
    expect(result.message).toBeDefined();
    expect(result.token).toBeDefined(); // Token retornado para testes
  });

  it("deve falhar com email inexistente (mas retornar sucesso por segurança)", async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

    const result = await forgotPassword.execute({ email: "nonexistent@example.com" });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("nonexistent@example.com");
    expect(mockResetTokenRepository.create).not.toHaveBeenCalled();
    expect(result.message).toBe(
      "Se o email existir, você receberá instruções para redefinir sua senha"
    );
  });

  it("deve falhar com email inválido", async () => {
    await expect(forgotPassword.execute({ email: "invalid-email" })).rejects.toThrow(
      "Email inválido"
    );
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it("deve armazenar token com expiração de 1 hora", async () => {
    const mockUser: IUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      password: "hashedpassword",
      phone: "1234567890",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockResetTokenRepository.create).mockImplementation(async data => {
      // Verificar que a expiração é aproximadamente 1 hora no futuro
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const diff = Math.abs(data.expires_at.getTime() - oneHourLater.getTime());

      expect(diff).toBeLessThan(5000); // Diferença menor que 5 segundos

      return {
        id: data.id,
        user_id: data.user_id,
        token: data.token,
        expires_at: data.expires_at,
        used: false,
        created_at: new Date(),
      };
    });

    await forgotPassword.execute({ email: "test@example.com" });

    expect(mockResetTokenRepository.create).toHaveBeenCalled();
  });
});
