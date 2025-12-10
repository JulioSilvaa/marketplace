import { UserRepositoryInMemory } from "../../../infra/repositories/UserRepositoryInMemory";

import { CreateUser } from "../../../core/useCases/users/Create";
import { beforeEach, describe, expect, it } from "vitest";
import { UserIsActive, UserRole } from "../../../types/user";

describe("UserRepositoryInMemory", () => {
  let userRepository: UserRepositoryInMemory;
  let createUserUseCase: CreateUser;
  beforeEach(() => {
    userRepository = new UserRepositoryInMemory();
    createUserUseCase = new CreateUser(userRepository);
  });

  it("Deveria criar um usuário", async () => {
    const userData = {
      id: "1",
      email: "user@example.com",
      password: "password123",
      name: "Test User",
      phone: "1234567890",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await createUserUseCase.execute(userData);
    const foundUser = await userRepository.findByEmail(userData.email);
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBeDefined();
    expect(foundUser?.email).toBe(userData.email);
    expect(foundUser?.name).toBe(userData.name);
    // Password should be hashed, so not equal to original
    expect(foundUser?.password).not.toBe(userData.password);
  });

  it("Deveria encontrar um usuário por email", async () => {
    const userData = {
      id: "2",
      email: "user2@example.com",
      password: "password456",
      name: "Test User 2",
      phone: "0987654321",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await userRepository.create(userData);
    const foundUser = await userRepository.findByEmail(userData.email);
    expect(foundUser).toEqual(userData);
  });

  it("Deveria retornar null ao buscar por email inexistente", async () => {
    const foundUser = await userRepository.findByEmail("nonexistent@example.com");
    expect(foundUser).toBeNull();
  });

  it.skip("Deveria retornar erro ao criar usuário com email já existente", async () => {
    const userData = {
      id: "3",
      email: "user3@example.com",
      password: "password789",
      name: "Test User 3",
      phone: "1122334455",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await await userRepository.create(userData);
    await expect(userRepository.create(userData)).rejects.toThrowError("email already exists");
  });
  it;
});
