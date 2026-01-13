export enum UserRole {
  PROPRIETARIO = "admin",
  CLIENTE = "user",
}

export enum UserIsActive {
  ATIVO = "active",
  INATIVO = "inactive",
}

export type IUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  checked: boolean;
  password: string;
  status: UserIsActive;
  role: UserRole;
  stripe_customer_id?: string;

  created_at?: Date;
  updated_at?: Date;
  region?: string;
  spaces?: { id: string; title: string; status: string }[];
  plan?: string;
  planValue?: number;
};
