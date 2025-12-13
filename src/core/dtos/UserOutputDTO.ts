import { UserIsActive, UserRole } from "../../types/user";

export interface UserOutputDTO {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  checked: boolean;
  status: string;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  // Note: password is intentionally excluded for security
}
