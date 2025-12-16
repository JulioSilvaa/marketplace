import { beforeEach, describe, expect, it } from "vitest";

import { DeleteUser } from "../../../core/useCases/users/Delete";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { UserIsActive, UserRole } from "../../../types/user";

describe("DeleteUser UseCase", () => {
  let deleteUser: DeleteUser;
  let userRepo: UserRepositoryInMemory;

  beforeEach(() => {
    userRepo = new UserRepositoryInMemory();
    deleteUser = new DeleteUser(userRepo);
  });

  it("deve deletar usuário com sucesso", async () => {
    const user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      phone: "11111111111",
      password: "password",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await userRepo.create(user);

    // Verificar que usuário existe
    const foundUser = await userRepo.findById("user-1");
    expect(foundUser).toBeDefined();

    // Deletar usuário
    await deleteUser.execute({ id: "user-1" });

    // Verificar que usuário foi deletado
    const deletedUser = await userRepo.findById("user-1");
    expect(deletedUser).toBeNull();
  });

  it("deve lançar erro ao tentar deletar usuário inexistente", async () => {
    await expect(deleteUser.execute({ id: "non-existent" })).rejects.toThrow("User not found");
  });

  it("deve remover usuário da lista de todos os usuários", async () => {
    const user1 = {
      id: "user-1",
      name: "User 1",
      email: "user1@example.com",
      phone: "11111111111",
      password: "password",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    const user2 = {
      id: "user-2",
      name: "User 2",
      email: "user2@example.com",
      phone: "22222222222",
      password: "password",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await userRepo.create(user1);
    await userRepo.create(user2);

    // Verificar que existem 2 usuários
    let allUsers = await userRepo.findAll();
    expect(allUsers).toHaveLength(2);

    // Deletar um usuário
    await deleteUser.execute({ id: "user-1" });

    // Verificar que agora existe apenas 1 usuário
    allUsers = await userRepo.findAll();
    expect(allUsers).toHaveLength(1);
    expect(allUsers[0].id).toBe("user-2");
  });
});
