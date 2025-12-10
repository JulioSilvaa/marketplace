import { IUser } from "../../types/user";

export interface IUserRepository {
  create(data: IUser): Promise<void>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  update(id: string, data: Partial<IUser>): Promise<void>;
  delete(id: string): Promise<void>;
}
