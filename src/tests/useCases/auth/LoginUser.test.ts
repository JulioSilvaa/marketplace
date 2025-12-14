import { describe, it, expect, beforeEach } from "vitest";
import { LoginUser } from "../../../core/useCases/auth/LoginUser";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { BcryptHashService } from "../../../infra/services/BcryptHashService";
import { UserRole, UserIsActive } from "../../../types/user";

describe("LoginUser Use Case", () => {
  let loginUser: LoginUser;
  let userRepository: UserRepositoryInMemory;
  let hashService: BcryptHashService;

  beforeEach(async () => {
    // Configurar variáveis de ambiente para testes
    if (!process.env.JWT_ACCESS_SECRET) {
      process.env.JWT_ACCESS_SECRET = "test-access-secret-key";
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
    }

    userRepository = new UserRepositoryInMemory();
    hashService = new BcryptHashService();
    loginUser = new LoginUser(userRepository, hashService);

    // Criar usuário de teste
    const hashedPassword = await hashService.hash("senha123");
    await userRepository.create({
      id: "user-test-id",
      name: "Teste Usuario",
      email: "teste@example.com",
      password: hashedPassword,
      phone: "11999999999",
      role: UserRole.PROPRIETARIO,
      checked: true,
      status: UserIsActive.ATIVO,
    });
  });

  it("deve fazer login com credenciais válidas", async () => {
    const result = await loginUser.execute({
      email: "teste@example.com",
      password: "senha123",
    });

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("user");
    expect(result.user.email).toBe("teste@example.com");
    expect(result.user.name).toBe("Teste Usuario");
    expect(result.user).not.toHaveProperty("password");
  });

  it("deve retornar refresh token (para cookie)", async () => {
    const result = (await loginUser.execute({
      email: "teste@example.com",
      password: "senha123",
    })) as any;

    expect(result).toHaveProperty("refreshToken");
    expect(typeof result.refreshToken).toBe("string");
    expect(result.refreshToken.length).toBeGreaterThan(0);
  });

  it("deve lançar erro com email inexistente", async () => {
    await expect(
      loginUser.execute({
        email: "naoexiste@example.com",
        password: "senha123",
      })
    ).rejects.toThrow("Credenciais inválidas");
  });

  it("deve lançar erro com senha incorreta", async () => {
    await expect(
      loginUser.execute({
        email: "teste@example.com",
        password: "senhaerrada",
      })
    ).rejects.toThrow("Credenciais inválidas");
  });

  it("deve validar formato de email", async () => {
    await expect(
      loginUser.execute({
        email: "email-invalido",
        password: "senha123",
      })
    ).rejects.toThrow();
  });

  it("não deve retornar senha do usuário no resultado", async () => {
    const result = await loginUser.execute({
      email: "teste@example.com",
      password: "senha123",
    });

    expect(result.user).not.toHaveProperty("password");
  });
});
