/// <reference path="../../@types/express/index.d.ts" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { prisma } from "../../lib/prisma";
import { createTestApp } from "../helpers/testApp";

describe("Auth E2E Tests", () => {
  const app = createTestApp();

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
    // Limpar entre cada teste
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
  });

  afterAll(async () => {
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    it("deve registrar novo usuário com sucesso", async () => {
      const response = await request(app).post("/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        phone: "11999999999",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Usuário criado com sucesso");
      expect(response.body.accessToken).toBeDefined();
      // refreshToken está em cookie HttpOnly, não no body
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("deve retornar erro ao tentar registrar email duplicado", async () => {
      await request(app).post("/auth/register").send({
        name: "User 1",
        email: "duplicate@example.com",
        phone: "11999999999",
        password: "password123",
      });

      const response = await request(app).post("/auth/register").send({
        name: "User 2",
        email: "duplicate@example.com",
        phone: "11999999999",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("email already exists");
    });

    it("deve retornar erro com payload inválido", async () => {
      const response = await request(app).post("/auth/register").send({
        name: "Test",
        // email faltando
        phone: "11999999999",
        password: "password123",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Criar usuário para testes de login
      await request(app).post("/auth/register").send({
        name: "Login User",
        email: "login@example.com",
        phone: "11999999999",
        password: "password123",
      });
    });

    it("deve fazer login com credenciais válidas", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      // refreshToken está em cookie HttpOnly, não no body
      expect(response.body.user.email).toBe("login@example.com");
    });

    it("deve retornar erro com credenciais inválidas", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Credenciais inválidas");
    });

    it("deve retornar erro com email inexistente", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Credenciais inválidas");
    });
  });

  describe("POST /auth/refresh", () => {
    it("deve gerar novo access token com refresh token válido", async () => {
      // Registrar e obter cookies
      const registerResponse = await request(app).post("/auth/register").send({
        name: "Refresh User",
        email: "refresh@example.com",
        phone: "11999999999",
        password: "password123",
      });

      // Extrair cookie do registro
      const cookies = registerResponse.headers["set-cookie"];

      const response = await request(app).post("/auth/refresh").set("Cookie", cookies); // Enviar cookie

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
    });

    it("deve retornar erro sem refresh token (cookie)", async () => {
      const response = await request(app).post("/auth/refresh");

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Refresh token não fornecido");
    });
  });

  describe("POST /auth/logout", () => {
    it("deve fazer logout com sucesso", async () => {
      const response = await request(app).post("/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout realizado com sucesso");
    });
  });

  describe("POST /auth/forgot-password", () => {
    beforeEach(async () => {
      await request(app).post("/auth/register").send({
        name: "Forgot User",
        email: "forgot@example.com",
        phone: "11999999999",
        password: "password123",
      });
    });

    it("deve enviar email de reset para usuário existente", async () => {
      const response = await request(app).post("/auth/forgot-password").send({
        email: "forgot@example.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it("deve retornar sucesso mesmo com email inexistente (segurança)", async () => {
      const response = await request(app).post("/auth/forgot-password").send({
        email: "nonexistent@example.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /auth/reset-password", () => {
    it("deve resetar senha com token válido", async () => {
      // Registrar usuário
      await request(app).post("/auth/register").send({
        name: "Reset User",
        email: "reset@example.com",
        phone: "11999999999",
        password: "oldpassword",
      });

      // Solicitar reset
      const forgotResponse = await request(app).post("/auth/forgot-password").send({
        email: "reset@example.com",
      });

      const token = forgotResponse.body.token;

      // Resetar senha
      const response = await request(app).post("/auth/reset-password").send({
        token,
        newPassword: "newpassword123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Senha redefinida com sucesso");

      // Verificar que pode fazer login com nova senha
      const loginResponse = await request(app).post("/auth/login").send({
        email: "reset@example.com",
        password: "newpassword123",
      });

      expect(loginResponse.status).toBe(200);
    });

    it("deve retornar erro com token inválido", async () => {
      const response = await request(app).post("/auth/reset-password").send({
        token: "invalid-token",
        newPassword: "newpassword123",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Fluxo E2E Completo: Registro → Login → Refresh → Logout", () => {
    it("deve completar fluxo de autenticação completo", async () => {
      // 1. Registrar
      const registerResponse = await request(app).post("/auth/register").send({
        name: "E2E User",
        email: "e2e@example.com",
        phone: "11999999999",
        password: "password123",
      });

      expect(registerResponse.status).toBe(201);
      const registerAccessToken = registerResponse.body.accessToken;
      const registerCookies = registerResponse.headers["set-cookie"];

      // 2. Login
      const loginResponse = await request(app).post("/auth/login").send({
        email: "e2e@example.com",
        password: "password123",
      });

      expect(loginResponse.status).toBe(200);
      const loginAccessToken = loginResponse.body.accessToken;
      const loginCookies = loginResponse.headers["set-cookie"];

      // 3. Refresh (usando cookies)
      const refreshResponse = await request(app).post("/auth/refresh").set("Cookie", loginCookies);

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.accessToken).toBeDefined();

      // 4. Logout
      const logoutResponse = await request(app).post("/auth/logout");

      expect(logoutResponse.status).toBe(200);
    });
  });
});
