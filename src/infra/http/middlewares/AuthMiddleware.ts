import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface IPayload {
  sub: string;
}

class AuthMiddleware {
  auth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    let token = "";

    if (authHeader) {
      const parts = authHeader.split(" ");
      if (parts.length === 2) {
        token = parts[1];
      }
    } else if (req.cookies && req.cookies["accessToken"]) {
      token = req.cookies["accessToken"];
    }

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    if (!process.env.JWT_ACCESS_SECRET) {
      return res.status(500).json({ message: "Erro de configuração do servidor" });
    }

    try {
      const { sub } = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as IPayload;

      req.user_id = sub;

      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  }
}

export default new AuthMiddleware();
