export enum UserRole {
  proprietario,
  cliente,
}

export type IUser = {
  id: string;
  email: string;
  nome: string;
  telefone: string;
  tipo: UserRole;
  verificado: boolean;
  password: string;
  isActive: boolean;
};
