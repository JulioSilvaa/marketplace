import { describe, it, expect, beforeEach } from "vitest";
import { RefreshToken } from "../../../core/useCases/auth/RefreshToken";
import { generateRefreshToken } from "../../../infra/services/GenerateTokens";
import jwt from "jsonwebtoken";

describe("RefreshToken Use Case", () => {
  let refreshTokenUseCase: RefreshToken;

  beforeEach(() => {
    refreshTokenUseCase = new RefreshToken();

    // Garantir que as variáveis de ambiente estejam configuradas
    if (!process.env.JWT_REFRESH_SECRET) {
      process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
    }
    if (!process.env.JWT_ACCESS_SECRET) {
      process.env.JWT_ACCESS_SECRET = "test-access-secret-key";
    }
  });

  it("deve gerar novo access token com refresh token válido", async () => {
    const userId = "user-test-id";
    const refreshToken = generateRefreshToken(userId);

    const result = await refreshTokenUseCase.execute(refreshToken);

    expect(result).toHaveProperty("accessToken");
    expect(typeof result.accessToken).toBe("string");
    expect(result.accessToken.length).toBeGreaterThan(0);
  });

  it("deve validar que o novo access token contém o userId correto", async () => {
    const userId = "user-test-id";
    const refreshToken = generateRefreshToken(userId);

    const result = await refreshTokenUseCase.execute(refreshToken);

    // Decodificar o access token para verificar o userId
    const decoded = jwt.decode(result.accessToken) as any;
    expect(decoded.sub).toBe(userId);
    expect(decoded.userId).toBe(userId);
  });

  it("deve lançar erro com refresh token inválido", async () => {
    const invalidToken = "token-invalido-qualquer";

    await expect(refreshTokenUseCase.execute(invalidToken)).rejects.toThrow(
      "Refresh token inválido ou expirado"
    );
  });

  it("deve lançar erro com refresh token expirado", async () => {
    // Criar token expirado manualmente
    const expiredToken = jwt.sign({ userId: "user-test-id" }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "-1h",
      subject: "user-test-id",
    });

    await expect(refreshTokenUseCase.execute(expiredToken)).rejects.toThrow(
      "Refresh token inválido ou expirado"
    );
  });

  it("deve lançar erro com token vazio", async () => {
    await expect(refreshTokenUseCase.execute("")).rejects.toThrow(
      "Refresh token inválido ou expirado"
    );
  });

  it("deve lançar erro se JWT_REFRESH_SECRET não estiver configurado", async () => {
    const originalSecret = process.env.JWT_REFRESH_SECRET;
    delete process.env.JWT_REFRESH_SECRET;

    await expect(refreshTokenUseCase.execute("any-token")).rejects.toThrow(
      "JWT_REFRESH_SECRET não configurado"
    );

    // Restaurar
    process.env.JWT_REFRESH_SECRET = originalSecret;
  });

  it("deve rejeitar token assinado com secret diferente", async () => {
    // Criar token com secret diferente
    const fakeToken = jwt.sign({ userId: "user-test-id" }, "wrong-secret-key", {
      expiresIn: "7d",
      subject: "user-test-id",
    });

    await expect(refreshTokenUseCase.execute(fakeToken)).rejects.toThrow(
      "Refresh token inválido ou expirado"
    );
  });
});
