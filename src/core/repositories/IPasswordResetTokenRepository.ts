export interface IPasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface IPasswordResetTokenRepository {
  create(data: {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
  }): Promise<IPasswordResetToken>;

  findByToken(token: string): Promise<IPasswordResetToken | null>;

  markAsUsed(id: string): Promise<void>;

  deleteExpired(): Promise<void>;
}
