import { IUser } from "../../../types/user";

export interface IAdminCustomerRepository {
  list(page: number, limit: number, search?: string): Promise<{ data: IUser[]; total: number }>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: string): Promise<void>;
}
