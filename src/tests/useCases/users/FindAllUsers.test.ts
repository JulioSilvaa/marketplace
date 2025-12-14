import { beforeEach, describe, expect, it } from "vitest";

import { FindAllUsers } from "../../../core/useCases/users/FindAll";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { UserIsActive, UserRole } from "../../../types/user";

describe("FindAllUsers UseCase", () => {
  let findAllUsers: FindAllUsers;
  let userRepo: UserRepositoryInMemory;

  beforeEach(() => {
    userRepo = new UserRepositoryInMemory();
    findAllUsers = new FindAllUsers(userRepo);
  });

  it("should return all users", async () => {
    const user1 = {
      id: "user-1",
      name: "User 1",
      email: "user1@example.com",
      phone: "11111111111",
      password: "password1",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    const user2 = {
      id: "user-2",
      name: "User 2",
      email: "user2@example.com",
      phone: "22222222222",
      password: "password2",
      role: UserRole.PROPRIETARIO,
      checked: false,
      status: UserIsActive.INATIVO,
    };

    await userRepo.create(user1);
    await userRepo.create(user2);

    const result = await findAllUsers.execute();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("user-1");
    expect(result[1].id).toBe("user-2");
  });

  it("should return empty array when no users exist", async () => {
    const result = await findAllUsers.execute();

    expect(result).toHaveLength(0);
  });
});
