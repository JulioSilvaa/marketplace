import { beforeEach, describe, expect, it } from "vitest";

import { FindByIdUser } from "../../../core/useCases/users/FindById";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { UserIsActive, UserRole } from "../../../types/user";

describe("FindByIdUser UseCase", () => {
  let findByIdUser: FindByIdUser;
  let userRepo: UserRepositoryInMemory;

  beforeEach(() => {
    userRepo = new UserRepositoryInMemory();
    findByIdUser = new FindByIdUser(userRepo);
  });

  it("should find a user by id", async () => {
    const user = {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      phone: "11999999999",
      password: "hashed-password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    await userRepo.create(user);

    const result = await findByIdUser.execute("user-1");

    expect(result).toBeDefined();
    expect(result?.id).toBe("user-1");
    expect(result?.name).toBe("John Doe");
    expect(result?.email).toBe("john@example.com");
  });

  it("should return null when user is not found", async () => {
    const result = await findByIdUser.execute("non-existent-id");

    expect(result).toBeNull();
  });
});
