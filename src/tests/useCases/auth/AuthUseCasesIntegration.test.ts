/// <reference path="../../../@types/express/index.d.ts" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { UserRepositoryPrisma } from "../../../infra/repositories/sql/UserRepositoryPrisma";
import { PasswordResetTokenRepositoryPrisma } from "../../../infra/repositories/sql/PasswordResetTokenRepositoryPrisma";
import { BcryptHashService } from "../../../infra/services/BcryptHashService";
import { LoginUser } from "../../../core/useCases/auth/LoginUser";
import { RefreshToken } from "../../../core/useCases/auth/RefreshToken";
import { ForgotPassword } from "../../../core/useCases/auth/ForgotPassword";
import { ResetPassword } from "../../../core/useCases/auth/ResetPassword";
import { IUser, UserRole, UserIsActive } from "../../../types/user";
import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";

describe("Auth Use Cases (Integration)", () => {
  let userRepository: UserRepositoryPrisma;
  let resetTokenRepository: PasswordResetTokenRepositoryPrisma;
  let hashService: BcryptHashService;
  let uuidGenerator: CryptoUuidGenerator;

  beforeAll(async () => {
    // Configurar variáveis de ambiente JWT para testes
    if (!process.env.JWT_ACCESS_SECRET) {
      process.env.JWT_ACCESS_SECRET = "test-access-secret-key";
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
    }

    // Limpar banco de dados
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
  });

  beforeEach(async () => {
    // Limpar entre cada teste para evitar conflitos
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});

    userRepository = new UserRepositoryPrisma();
    resetTokenRepository = new PasswordResetTokenRepositoryPrisma();
    hashService = new BcryptHashService();
    uuidGenerator = new CryptoUuidGenerator();
  });

  afterAll(async () => {
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.$disconnect();
  });

  describe("LoginUser (Integration)", () => {
    it("deve fazer login com credenciais válidas e retornar tokens", async () => {
      const loginUser = new LoginUser(userRepository, hashService);
      const password = "password123";
      const hashedPassword = await hashService.hash(password);

      const testUser: IUser = {
        id: uuidGenerator.generate(),
        email: "login@test.com",
        name: "Login Test",
        password: hashedPassword,
        phone: "1234567890",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      await userRepository.create(testUser);

      const result = (await loginUser.execute({
        email: "login@test.com",
        password: "password123",
      })) as any;

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe("login@test.com");
    });

    it("deve falhar com credenciais inválidas", async () => {
      const loginUser = new LoginUser(userRepository, hashService);

      await expect(
        loginUser.execute({
          email: "nonexistent@test.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("Credenciais inválidas");
    });
  });

  describe("RefreshToken (Integration)", () => {
    it("deve gerar novo access token com refresh token válido", async () => {
      const loginUser = new LoginUser(userRepository, hashService);
      const refreshTokenUseCase = new RefreshToken();
      const password = "password123";
      const hashedPassword = await hashService.hash(password);

      const testUser: IUser = {
        id: uuidGenerator.generate(),
        email: "refresh@test.com",
        name: "Refresh Test",
        password: hashedPassword,
        phone: "1234567890",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      await userRepository.create(testUser);

      const loginResult = (await loginUser.execute({
        email: "refresh@test.com",
        password: "password123",
      })) as any;

      const refreshResult = await refreshTokenUseCase.execute(loginResult.refreshToken);

      expect(refreshResult.accessToken).toBeDefined();
      // Access token pode ser o mesmo se ainda válido
    });

    it("deve falhar com refresh token inválido", async () => {
      const refreshTokenUseCase = new RefreshToken();

      await expect(refreshTokenUseCase.execute("invalid-token")).rejects.toThrow();
    });
  });

  describe("ForgotPassword (Integration)", () => {
    it("deve gerar token de reset para email válido", async () => {
      const forgotPassword = new ForgotPassword(userRepository, resetTokenRepository);
      const hashedPassword = await hashService.hash("password123");

      const testUser: IUser = {
        id: uuidGenerator.generate(),
        email: "forgot@test.com",
        name: "Forgot Test",
        password: hashedPassword,
        phone: "1234567890",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      await userRepository.create(testUser);

      const result = await forgotPassword.execute({ email: "forgot@test.com" });

      expect(result.message).toBeDefined();
      expect(result.token).toBeDefined();

      // Verificar que o token foi armazenado no banco
      const storedToken = await resetTokenRepository.findByToken(result.token!);
      expect(storedToken).toBeDefined();
      expect(storedToken?.user_id).toBe(testUser.id);
    });

    it("deve armazenar data de expiração do token", async () => {
      const forgotPassword = new ForgotPassword(userRepository, resetTokenRepository);
      const hashedPassword = await hashService.hash("password123");

      const testUser: IUser = {
        id: uuidGenerator.generate(),
        email: "expiration@test.com",
        name: "Expiration Test",
        password: hashedPassword,
        phone: "1234567890",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      await userRepository.create(testUser);

      const result = await forgotPassword.execute({ email: "expiration@test.com" });
      const storedToken = await resetTokenRepository.findByToken(result.token!);

      expect(storedToken?.expires_at).toBeDefined();
      expect(storedToken!.expires_at.getTime()).toBeGreaterThan(Date.now());
    });

    it("deve retornar sucesso mesmo com email inexistente (segurança)", async () => {
      const forgotPassword = new ForgotPassword(userRepository, resetTokenRepository);

      const result = await forgotPassword.execute({ email: "nonexistent@test.com" });

      expect(result.message).toBe(
        "Se o email existir, você receberá instruções para redefinir sua senha"
      );
    });
  });

  describe("ResetPassword (Integration)", () => {
    it("deve resetar senha com token válido", async () => {
      const forgotPassword = new ForgotPassword(userRepository, resetTokenRepository);
      const resetPassword = new ResetPassword(userRepository, resetTokenRepository, hashService);
      const hashedPassword = await hashService.hash("oldpassword");

      const testUser: IUser = {
        id: uuidGenerator.generate(),
        email: "reset@test.com",
        name: "Reset Test",
        password: hashedPassword,
        phone: "1234567890",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      await userRepository.create(testUser);

      // Gerar token de reset
      const forgotResult = await forgotPassword.execute({ email: "reset@test.com" });

      // Resetar senha
      const resetResult = await resetPassword.execute({
        token: forgotResult.token!,
        newPassword: "newpassword123",
      });

      expect(resetResult.message).toBe("Senha redefinida com sucesso");

      // Verificar que a senha foi atualizada
      const loginUser = new LoginUser(userRepository, hashService);
      const loginResult = await loginUser.execute({
        email: "reset@test.com",
        password: "newpassword123",
      });

      expect(loginResult).toBeDefined();
    });

    it("deve invalidar token após uso bem-sucedido", async () => {
      const forgotPassword = new ForgotPassword(userRepository, resetTokenRepository);
      const resetPassword = new ResetPassword(userRepository, resetTokenRepository, hashService);
      const hashedPassword = await hashService.hash("oldpassword");

      const testUser: IUser = {
        id: uuidGenerator.generate(),
        email: "invalidate@test.com",
        name: "Invalidate Test",
        password: hashedPassword,
        phone: "1234567890",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      await userRepository.create(testUser);

      const forgotResult = await forgotPassword.execute({ email: "invalidate@test.com" });

      await resetPassword.execute({
        token: forgotResult.token!,
        newPassword: "newpassword123",
      });

      // Tentar reusar o token
      await expect(
        resetPassword.execute({
          token: forgotResult.token!,
          newPassword: "anotherpassword",
        })
      ).rejects.toThrow("Token já foi utilizado");
    });

    it("deve falhar com token expirado", async () => {
      const resetPassword = new ResetPassword(userRepository, resetTokenRepository, hashService);
      const hashedPassword = await hashService.hash("oldpassword");

      const testUser: IUser = {
        id: uuidGenerator.generate(),
        email: "expired@test.com",
        name: "Expired Test",
        password: hashedPassword,
        phone: "1234567890",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      await userRepository.create(testUser);

      // Criar token expirado manualmente
      const expiredToken = await resetTokenRepository.create({
        id: uuidGenerator.generate(),
        user_id: testUser.id,
        token: "expired-token-123",
        expires_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hora no passado
      });

      await expect(
        resetPassword.execute({
          token: expiredToken.token,
          newPassword: "newpassword123",
        })
      ).rejects.toThrow("Token expirado");
    });
  });

  describe("Fluxo End-to-End", () => {
    it("Forgot Password → Reset Password → Login com nova senha", async () => {
      const forgotPassword = new ForgotPassword(userRepository, resetTokenRepository);
      const resetPassword = new ResetPassword(userRepository, resetTokenRepository, hashService);
      const loginUser = new LoginUser(userRepository, hashService);
      const hashedPassword = await hashService.hash("originalpassword");

      const testUser: IUser = {
        id: uuidGenerator.generate(),
        email: "e2e@test.com",
        name: "E2E Test",
        password: hashedPassword,
        phone: "1234567890",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      await userRepository.create(testUser);

      // 1. Solicitar reset de senha
      const forgotResult = await forgotPassword.execute({ email: "e2e@test.com" });
      expect(forgotResult.token).toBeDefined();

      // 2. Resetar senha
      const resetResult = await resetPassword.execute({
        token: forgotResult.token!,
        newPassword: "mynewpassword",
      });
      expect(resetResult.message).toBe("Senha redefinida com sucesso");

      // 3. Login com nova senha
      const loginResult = (await loginUser.execute({
        email: "e2e@test.com",
        password: "mynewpassword",
      })) as any;

      expect(loginResult.accessToken).toBeDefined();
      expect(loginResult.user.email).toBe("e2e@test.com");

      // 4. Verificar que senha antiga não funciona mais
      await expect(
        loginUser.execute({
          email: "e2e@test.com",
          password: "originalpassword",
        })
      ).rejects.toThrow("Credenciais inválidas");
    });
  });
});
