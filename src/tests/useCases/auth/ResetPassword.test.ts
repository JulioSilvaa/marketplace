/// <reference path="../../../@types/express/index.d.ts" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResetPassword } from "../../../core/useCases/auth/ResetPassword";
import { IUserRepository } from "../../../core/repositories/IUserRepository";
import { IPasswordResetTokenRepository } from "../../../core/repositories/IPasswordResetTokenRepository";
import { IHashService } from "../../../core/services/IHashService";
import { IPasswordResetToken } from "../../../core/repositories/IPasswordResetTokenRepository";

describe("ResetPassword", () => {
  let resetPassword: ResetPassword;
  let mockUserRepository: IUserRepository;
  let mockResetTokenRepository: IPasswordResetTokenRepository;
  let mockHashService: IHashService;

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

    // Mock do serviço de hash
    mockHashService = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    resetPassword = new ResetPassword(
      mockUserRepository,
      mockResetTokenRepository,
      mockHashService
    );
  });

  it("deve resetar senha com token válido", async () => {
    const mockToken: IPasswordResetToken = {
      id: "token-123",
      user_id: "user-123",
      token: "valid-token",
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hora no futuro
      used: false,
      created_at: new Date(),
    };

    vi.mocked(mockResetTokenRepository.findByToken).mockResolvedValue(mockToken);
    vi.mocked(mockHashService.hash).mockResolvedValue("hashed-new-password");
    vi.mocked(mockUserRepository.update).mockResolvedValue();
    vi.mocked(mockResetTokenRepository.markAsUsed).mockResolvedValue();

    const result = await resetPassword.execute({
      token: "valid-token",
      newPassword: "newpassword123",
    });

    expect(mockResetTokenRepository.findByToken).toHaveBeenCalledWith("valid-token");
    expect(mockHashService.hash).toHaveBeenCalledWith("newpassword123");
    expect(mockUserRepository.update).toHaveBeenCalledWith("user-123", {
      password: "hashed-new-password",
    });
    expect(mockResetTokenRepository.markAsUsed).toHaveBeenCalledWith("token-123");
    expect(result.message).toBe("Senha redefinida com sucesso");
  });

  it("deve falhar com token inválido", async () => {
    vi.mocked(mockResetTokenRepository.findByToken).mockResolvedValue(null);

    await expect(
      resetPassword.execute({
        token: "invalid-token",
        newPassword: "newpassword123",
      })
    ).rejects.toThrow("Token inválido ou expirado");

    expect(mockHashService.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it("deve falhar com token expirado", async () => {
    const mockToken: IPasswordResetToken = {
      id: "token-123",
      user_id: "user-123",
      token: "expired-token",
      expires_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hora no passado
      used: false,
      created_at: new Date(),
    };

    vi.mocked(mockResetTokenRepository.findByToken).mockResolvedValue(mockToken);

    await expect(
      resetPassword.execute({
        token: "expired-token",
        newPassword: "newpassword123",
      })
    ).rejects.toThrow("Token expirado");

    expect(mockHashService.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it("deve falhar com senha fraca", async () => {
    const mockToken: IPasswordResetToken = {
      id: "token-123",
      user_id: "user-123",
      token: "valid-token",
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
      created_at: new Date(),
    };

    vi.mocked(mockResetTokenRepository.findByToken).mockResolvedValue(mockToken);

    await expect(
      resetPassword.execute({
        token: "valid-token",
        newPassword: "123", // Senha muito curta
      })
    ).rejects.toThrow("A senha deve ter no mínimo 6 caracteres");

    expect(mockHashService.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it("deve invalidar token após uso", async () => {
    const mockToken: IPasswordResetToken = {
      id: "token-123",
      user_id: "user-123",
      token: "valid-token",
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
      created_at: new Date(),
    };

    vi.mocked(mockResetTokenRepository.findByToken).mockResolvedValue(mockToken);
    vi.mocked(mockHashService.hash).mockResolvedValue("hashed-new-password");
    vi.mocked(mockUserRepository.update).mockResolvedValue();
    vi.mocked(mockResetTokenRepository.markAsUsed).mockResolvedValue();

    await resetPassword.execute({
      token: "valid-token",
      newPassword: "newpassword123",
    });

    expect(mockResetTokenRepository.markAsUsed).toHaveBeenCalledWith("token-123");
  });

  it("deve falhar ao reusar token já utilizado", async () => {
    const mockToken: IPasswordResetToken = {
      id: "token-123",
      user_id: "user-123",
      token: "used-token",
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      used: true, // Token já foi usado
      created_at: new Date(),
    };

    vi.mocked(mockResetTokenRepository.findByToken).mockResolvedValue(mockToken);

    await expect(
      resetPassword.execute({
        token: "used-token",
        newPassword: "newpassword123",
      })
    ).rejects.toThrow("Token já foi utilizado");

    expect(mockHashService.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
});
