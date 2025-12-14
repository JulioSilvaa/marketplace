import {
  IPasswordResetToken,
  IPasswordResetTokenRepository,
} from "../../../core/repositories/IPasswordResetTokenRepository";
import { prisma } from "../../../lib/prisma";

export class PasswordResetTokenRepositoryPrisma implements IPasswordResetTokenRepository {
  async create(data: {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
  }): Promise<IPasswordResetToken> {
    const resetToken = await prisma.password_reset_tokens.create({
      data: {
        id: data.id,
        user_id: data.user_id,
        token: data.token,
        expires_at: data.expires_at,
      },
    });

    return {
      id: resetToken.id,
      user_id: resetToken.user_id,
      token: resetToken.token,
      expires_at: resetToken.expires_at,
      used: resetToken.used,
      created_at: resetToken.created_at,
    };
  }

  async findByToken(token: string): Promise<IPasswordResetToken | null> {
    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return null;
    }

    return {
      id: resetToken.id,
      user_id: resetToken.user_id,
      token: resetToken.token,
      expires_at: resetToken.expires_at,
      used: resetToken.used,
      created_at: resetToken.created_at,
    };
  }

  async markAsUsed(id: string): Promise<void> {
    await prisma.password_reset_tokens.update({
      where: { id },
      data: { used: true },
    });
  }

  async deleteExpired(): Promise<void> {
    await prisma.password_reset_tokens.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  }
}
