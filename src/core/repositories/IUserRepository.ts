import { IUser } from "../../types/user";

export interface IUserRepository {
  create(data: IUser): Promise<void>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  search(filters: { name?: string; email?: string; isActive?: boolean }): Promise<IUser[]>;
  update(id: string, data: Partial<IUser>): Promise<void>;
  delete(id: string): Promise<void>;
}
