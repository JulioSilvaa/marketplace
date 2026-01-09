import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { IAdminUserRepository } from "../../../repositories/admin/IAdminUserRepository";

const { sign } = jwt;

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  admin: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
}

export class LoginAdmin {
  constructor(private adminUserRepository: IAdminUserRepository) {}

  async execute({ email, password }: IRequest): Promise<IResponse> {
    const admin = await this.adminUserRepository.findByEmail(email);

    if (!admin) {
      throw new Error("Admin não encontrado com este e-mail");
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      throw new Error("Senha incorreta");
    }

    if (!process.env.JWT_ADMIN_SECRET) {
      throw new Error("Erro de configuração do servidor");
    }

    const token = sign({ role: admin.role }, process.env.JWT_ADMIN_SECRET, {
      subject: admin.id,
      expiresIn: "1d",
    });

    await this.adminUserRepository.updateLastLogin(admin.id);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      token,
    };
  }
}
