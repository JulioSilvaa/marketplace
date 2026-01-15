import { NextFunction, Request, Response } from "express";

import { LoginDTO } from "../../../core/dtos/LoginDTO";
import { AuditLogUseCaseFactory } from "../../factories/AuditLogUseCaseFactory";
import { AuthUseCaseFactory } from "../../factories/AuthUseCaseFactory";
import { UserUseCaseFactory } from "../../factories/UserUseCaseFactory";

export default class AuthController {
  // Configuração de cookies
  private static readonly COOKIE_NAME = "refreshToken";
  private static readonly COOKIE_OPTIONS = {
    httpOnly: true, // Não acessível via JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS apenas em produção
    sameSite: "strict" as const, // Proteção CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
    path: "/", // Cookie disponível em todas as rotas
  };

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData: LoginDTO = req.body;

      const loginUser = AuthUseCaseFactory.makeLoginUser();
      const result = (await loginUser.execute(loginData)) as any;

      // 📝 AUDIT LOG: Login Success
      const createAuditLog = AuditLogUseCaseFactory.makeCreateAuditLog();
      await createAuditLog.execute({
        userId: result.user.id,
        action: "LOGIN",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        details: { email: loginData.email },
      });

      // Definir refresh token no cookie HttpOnly
      res.cookie(AuthController.COOKIE_NAME, result.refreshToken, AuthController.COOKIE_OPTIONS);

      // Retornar apenas access token e dados do usuário
      return res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Criar usuário
      const createUser = UserUseCaseFactory.makeCreateUser();
      await createUser.execute(req.body);

      // Fazer login automático após registro
      const loginData: LoginDTO = {
        email: req.body.email,
        password: req.body.password,
      };

      const loginUser = AuthUseCaseFactory.makeLoginUser();
      const result = (await loginUser.execute(loginData)) as any;

      // Definir refresh token no cookie HttpOnly
      res.cookie(AuthController.COOKIE_NAME, result.refreshToken, AuthController.COOKIE_OPTIONS);

      // Retornar access token e dados do usuário
      return res.status(201).json({
        message: "Usuário criado com sucesso",
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Ler refresh token do cookie
      const refreshToken = req.cookies[AuthController.COOKIE_NAME];

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token não fornecido" });
      }

      const refreshTokenUseCase = AuthUseCaseFactory.makeRefreshToken();
      const result = await refreshTokenUseCase.execute(refreshToken);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Limpar cookie de refresh token
      res.clearCookie(AuthController.COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return res.status(200).json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const forgotPasswordUseCase = AuthUseCaseFactory.makeForgotPassword();
      const result = await forgotPasswordUseCase.execute(req.body);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const resetPasswordUseCase = AuthUseCaseFactory.makeResetPassword();
      const result = await resetPasswordUseCase.execute(req.body);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user_id;

      if (!userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const changePasswordUseCase = AuthUseCaseFactory.makeChangePassword();
      const result = await changePasswordUseCase.execute(userId, req.body);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
