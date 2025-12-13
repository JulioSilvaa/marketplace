import { beforeEach, describe, expect, it } from "vitest";

import { SearchUser } from "../../../core/useCases/users/Search";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { UserIsActive, UserRole } from "../../../types/user";

describe("SearchUser UseCase", () => {
  let searchUser: SearchUser;
  let userRepo: UserRepositoryInMemory;

  beforeEach(() => {
    userRepo = new UserRepositoryInMemory();
    searchUser = new SearchUser(userRepo);
  });

  it("should search users by name", async () => {
    const user1 = {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      phone: "11111111111",
      password: "password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    const user2 = {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "22222222222",
      password: "password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    await userRepo.create(user1);
    await userRepo.create(user2);

    const result = await searchUser.execute({ name: "John" });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("John Doe");
  });

  it("should search users by email", async () => {
    const user = {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      phone: "11111111111",
      password: "password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    await userRepo.create(user);

    const result = await searchUser.execute({ email: "john@example.com" });

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("john@example.com");
  });

  it("should search users by status", async () => {
    const user1 = {
      id: "user-1",
      name: "Active User",
      email: "active@example.com",
      phone: "11111111111",
      password: "password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    const user2 = {
      id: "user-2",
      name: "Inactive User",
      email: "inactive@example.com",
      phone: "22222222222",
      password: "password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.INATIVO,
    };

    await userRepo.create(user1);
    await userRepo.create(user2);

    const result = await searchUser.execute({ isActive: true });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(UserIsActive.ATIVO);
  });

  it("should return empty array when no users match", async () => {
    const result = await searchUser.execute({ name: "NonExistent" });

    expect(result).toHaveLength(0);
  });
});
