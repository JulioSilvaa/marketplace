import { beforeEach, describe, expect, it } from "vitest";

import { UpdateUser } from "../../../core/useCases/users/Update";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { UserIsActive, UserRole } from "../../../types/user";

describe("UpdateUser UseCase", () => {
  let updateUser: UpdateUser;
  let userRepo: UserRepositoryInMemory;

  beforeEach(() => {
    userRepo = new UserRepositoryInMemory();
    updateUser = new UpdateUser(userRepo);
  });

  it("should update user successfully", async () => {
    const user = {
      id: "user-1",
      name: "Old Name",
      email: "old@example.com",
      phone: "11111111111",
      password: "password",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await userRepo.create(user);

    await updateUser.execute({
      id: "user-1",
      name: "New Name",
      email: "new@example.com",
      phone: "99999999999",
    });

    const updated = await userRepo.findById("user-1");

    expect(updated).toBeDefined();
    expect(updated?.name).toBe("New Name");
    expect(updated?.email).toBe("new@example.com");
    expect(updated?.phone).toBe("99999999999");
  });

  it("should throw error when user is not found", async () => {
    await expect(
      updateUser.execute({
        id: "non-existent",
        name: "New Name",
      })
    ).rejects.toThrow("User not found");
  });

  it("should update only provided fields", async () => {
    const user = {
      id: "user-1",
      name: "Original Name",
      email: "original@example.com",
      phone: "11111111111",
      password: "password",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await userRepo.create(user);

    await updateUser.execute({
      id: "user-1",
      name: "Updated Name",
    });

    const updated = await userRepo.findById("user-1");

    expect(updated?.name).toBe("Updated Name");
    expect(updated?.email).toBe("original@example.com"); // Should remain unchanged
    expect(updated?.phone).toBe("11111111111"); // Should remain unchanged
  });
});
