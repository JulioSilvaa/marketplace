import { ForgotPassword } from "../../core/useCases/auth/ForgotPassword";
import { LoginUser } from "../../core/useCases/auth/LoginUser";
import { RefreshToken } from "../../core/useCases/auth/RefreshToken";
import { ResetPassword } from "../../core/useCases/auth/ResetPassword";
import { PasswordResetTokenRepositoryPrisma } from "../repositories/sql/PasswordResetTokenRepositoryPrisma";
import { UserRepositoryPrisma } from "../repositories/sql/UserRepositoryPrisma";
import { BcryptHashService } from "../services/BcryptHashService";
import { ResendEmailService } from "../services/ResendEmailService";

export class AuthUseCaseFactory {
  static makeLoginUser(): LoginUser {
    const userRepository = new UserRepositoryPrisma();
    const hashService = new BcryptHashService();
    return new LoginUser(userRepository, hashService);
  }

  static makeRefreshToken(): RefreshToken {
    return new RefreshToken();
  }

  static makeForgotPassword(): ForgotPassword {
    const userRepository = new UserRepositoryPrisma();
    const resetTokenRepository = new PasswordResetTokenRepositoryPrisma();
    const emailService = new ResendEmailService();
    return new ForgotPassword(userRepository, resetTokenRepository, emailService);
  }

  static makeResetPassword(): ResetPassword {
    const userRepository = new UserRepositoryPrisma();
    const resetTokenRepository = new PasswordResetTokenRepositoryPrisma();
    const hashService = new BcryptHashService();
    return new ResetPassword(userRepository, resetTokenRepository, hashService);
  }
}
