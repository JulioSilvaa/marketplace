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
  whatsapp?: string;
  facebook_url?: string;
  instagram_url?: string;
  created_at?: Date;
  updated_at?: Date;
};
