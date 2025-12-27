import { UserRole } from "../../types/user";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsapp?: string;
  role?: UserRole;
}
