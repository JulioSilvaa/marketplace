export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  last_login_at: Date | null;
}

export interface IAdminUserRepository {
  findByEmail(email: string): Promise<AdminUser | null>;
  findById(id: string): Promise<AdminUser | null>;
  create(
    data: Omit<AdminUser, "id" | "created_at" | "updated_at" | "last_login_at">
  ): Promise<AdminUser>;
  updateLastLogin(id: string): Promise<void>;
}
