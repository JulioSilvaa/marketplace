import { IUserRepository } from "../../core/repositories/userRepository";
import { IUser } from "../../types/user";

export class UserRepositoryInMemory implements IUserRepository {
  private users: IUser[] = [];

  async create(data: IUser): Promise<void> {
    await this.users.push(data);
  }
  async findByEmail(email: string): Promise<IUser | null> {
    const user = this.users.find(user => user.email === email);
    return user || null;
  }
  async findById(id: string): Promise<IUser | null> {
    const user = this.users.find(user => user.id === id);
    return user || null;
  }
  async findAll(): Promise<IUser[]> {
    return this.users;
  }
  async findByName(name: string): Promise<IUser | null> {
    const user = this.users.find(user => user.name === name);
    return user || null;
  }

  async update(id: string, data: Partial<IUser>): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    this.users[userIndex] = { ...this.users[userIndex], ...data };
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    this.users.splice(userIndex, 1);
  }
}
