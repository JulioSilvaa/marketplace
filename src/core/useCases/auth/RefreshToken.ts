import jwt from "jsonwebtoken";

import { generateAccessToken } from "../../../infra/services/GenerateTokens";

interface IPayload {
  sub: string;
  userId: string;
}

export class RefreshToken {
  async execute(refreshToken: string): Promise<{ accessToken: string }> {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT_REFRESH_SECRET não configurado");
    }

    try {
      // Verificar se o refresh token é válido
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as IPayload;

      // Gerar novo access token
      const accessToken = generateAccessToken(decoded.sub);

      return { accessToken };
    } catch (error) {
      throw new Error("Refresh token inválido ou expirado");
    }
  }
}
