import { LoginAdmin } from "../core/useCases/admin/auth/LoginAdmin";
import { AdminUserRepository } from "../infra/repositories/sql/admin/AdminUserRepository";

export class AdminUseCaseFactory {
  static makeLoginAdmin(): LoginAdmin {
    const adminUserRepository = new AdminUserRepository();
    return new LoginAdmin(adminUserRepository);
  }
}
