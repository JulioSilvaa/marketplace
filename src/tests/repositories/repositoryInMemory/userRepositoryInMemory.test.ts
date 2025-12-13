import { UserRepositoryInMemory } from "../../../infra/repositories/UserRepositoryInMemory";

import { CreateUser } from "../../../core/useCases/users/Create";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserIsActive, UserRole } from "../../../types/user";
import { IHashService } from "../../../core/services/IHashService";
import { IUuidGenerator } from "../../../core/services/IUuidGenerator";

describe("UserRepositoryInMemory", () => {
  let userRepository: UserRepositoryInMemory;
  let createUserUseCase: CreateUser;
  let mockHashService: IHashService;
  let mockUuidGenerator: IUuidGenerator;

  beforeEach(() => {
    userRepository = new UserRepositoryInMemory();

    mockHashService = {
      hash: vi.fn().mockResolvedValue("hashed_password"),
      compare: vi.fn().mockResolvedValue(true),
    };

    mockUuidGenerator = {
      generate: vi.fn().mockReturnValue("generated-uuid-123"),
    };

    createUserUseCase = new CreateUser(userRepository, mockHashService, mockUuidGenerator);
  });

  it("Deveria criar um usuário", async () => {
    const userData = {
      email: "user@example.com",
      password: "password123",
      name: "Test User",
      phone: "1234567890",
      role: UserRole.CLIENTE,
    };

    await createUserUseCase.execute(userData);
    const foundUser = await userRepository.findByEmail(userData.email);
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe("generated-uuid-123");
    expect(foundUser?.email).toBe(userData.email);
    expect(foundUser?.name).toBe(userData.name);
    expect(foundUser?.password).toBe("hashed_password");
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
