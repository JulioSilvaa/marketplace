/// <reference path="../../@types/express/index.d.ts" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import AuthMiddleware from "../../infra/http/middlewares/AuthMiddleware";
import { generateAccessToken } from "../../infra/services/GenerateTokens";

describe("AuthMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Configurar variáveis de ambiente
    if (!process.env.JWT_ACCESS_SECRET) {
      process.env.JWT_ACCESS_SECRET = "test-access-secret-key";
    }

    // Mock de Request
    mockRequest = {
      headers: {},
    };

    // Mock de Response
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    // Mock de NextFunction
    mockNext = vi.fn();
  });

  it("deve permitir acesso com token válido", () => {
    const userId = "user-test-id";
    const token = generateAccessToken(userId);

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    AuthMiddleware.auth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user_id).toBe(userId);
  });

  it("deve bloquear acesso sem header de autorização", () => {
    mockRequest.headers = {};

    AuthMiddleware.auth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Token não fornecido",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve bloquear acesso com header sem token", () => {
    mockRequest.headers = {
      authorization: "Bearer ",
    };

    AuthMiddleware.auth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Token inválido",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve bloquear acesso com token inválido", () => {
    mockRequest.headers = {
      authorization: "Bearer token-invalido-qualquer",
    };

    AuthMiddleware.auth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Token inválido ou expirado",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve bloquear acesso com token expirado", () => {
    // Criar token expirado manualmente
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign({ userId: "user-test-id" }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "-1h",
      subject: "user-test-id",
    });

    mockRequest.headers = {
      authorization: `Bearer ${expiredToken}`,
    };

    AuthMiddleware.auth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Token inválido ou expirado",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve extrair user_id do token e adicionar ao request", () => {
    const userId = "user-123-abc";
    const token = generateAccessToken(userId);

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    AuthMiddleware.auth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.user_id).toBe(userId);
    expect(mockNext).toHaveBeenCalled();
  });

  it("deve retornar erro se JWT_ACCESS_SECRET não estiver configurado", () => {
    const originalSecret = process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_ACCESS_SECRET;

    mockRequest.headers = {
      authorization: "Bearer any-token",
    };

    AuthMiddleware.auth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Erro de configuração do servidor",
    });
    expect(mockNext).not.toHaveBeenCalled();

    // Restaurar
    process.env.JWT_ACCESS_SECRET = originalSecret;
  });
});
