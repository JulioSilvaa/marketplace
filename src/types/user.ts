export enum UserRole {
  PROPRIETARIO,
  CLIENTE,
}

export enum UserIsActive {
  ATIVO,
  INATIVO,
}

export type IUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  checked: boolean;
  password: string;
  status: UserIsActive;

  created_at?: Date;
  updated_at?: Date;
  region?: string;
  spaces?: { id: string; title: string; status: string }[];
};
