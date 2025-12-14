import bcrypt from "bcryptjs";

import { IHashService } from "../../core/services/IHashService";

export class BcryptHashService implements IHashService {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, Number(process.env.BCRYPT_SALT));
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
