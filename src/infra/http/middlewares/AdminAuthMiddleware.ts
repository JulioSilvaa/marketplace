import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface IPayload {
  sub: string;
  role: string;
}

class AdminAuthMiddleware {
  auth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ message: "Token inválido" });
    }

    if (!process.env.JWT_ADMIN_SECRET) {
      console.error("JWT_ADMIN_SECRET not defined");
      return res.status(500).json({ message: "Erro de configuração do servidor" });
    }

    try {
      const { sub, role } = jwt.verify(token, process.env.JWT_ADMIN_SECRET) as IPayload;

      req.user_id = sub;
      // We could attach role to req if needed, e.g. req.user_role = role;

      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  }
}

export default new AdminAuthMiddleware();
