import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";

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

  it("Deveria retornar erro ao criar usuário com email já existente", async () => {
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

  it("Deveria encontrar um usuário por ID", async () => {
    const userData = {
      id: "user-123",
      email: "findbyid@example.com",
      password: "password",
      name: "Find By ID User",
      phone: "1234567890",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    await userRepository.create(userData);
    const foundUser = await userRepository.findById("user-123");

    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe("user-123");
    expect(foundUser?.email).toBe("findbyid@example.com");
  });

  it("Deveria retornar todos os usuários", async () => {
    const user1 = {
      id: "user-1",
      email: "user1@example.com",
      password: "password",
      name: "User 1",
      phone: "1111111111",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    const user2 = {
      id: "user-2",
      email: "user2@example.com",
      password: "password",
      name: "User 2",
      phone: "2222222222",
      role: UserRole.PROPRIETARIO,
      checked: false,
      status: UserIsActive.INATIVO,
    };

    await userRepository.create(user1);
    await userRepository.create(user2);

    const allUsers = await userRepository.findAll();

    expect(allUsers).toHaveLength(2);
    expect(allUsers[0].id).toBe("user-1");
    expect(allUsers[1].id).toBe("user-2");
  });

  it("Deveria atualizar um usuário", async () => {
    const userData = {
      id: "user-update",
      email: "update@example.com",
      password: "password",
      name: "Original Name",
      phone: "1234567890",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await userRepository.create(userData);

    const updatedData = {
      ...userData,
      name: "Updated Name",
      email: "newemail@example.com",
    };

    await userRepository.update("user-update", updatedData);
    const updatedUser = await userRepository.findById("user-update");

    expect(updatedUser?.name).toBe("Updated Name");
    expect(updatedUser?.email).toBe("newemail@example.com");
  });

  it("Deveria deletar um usuário", async () => {
    const userData = {
      id: "user-delete",
      email: "delete@example.com",
      password: "password",
      name: "Delete User",
      phone: "1234567890",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    await userRepository.create(userData);
    await userRepository.delete("user-delete");

    const deletedUser = await userRepository.findById("user-delete");
    expect(deletedUser).toBeNull();
  });

  it("Deveria buscar usuários com filtros", async () => {
    const user1 = {
      id: "user-search-1",
      email: "john@example.com",
      password: "password",
      name: "John Doe",
      phone: "1111111111",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    const user2 = {
      id: "user-search-2",
      email: "jane@example.com",
      password: "password",
      name: "Jane Smith",
      phone: "2222222222",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.INATIVO,
    };

    await userRepository.create(user1);
    await userRepository.create(user2);

    const searchByName = await userRepository.search({ name: "John" });
    expect(searchByName).toHaveLength(1);
    expect(searchByName[0].name).toBe("John Doe");

    const searchByStatus = await userRepository.search({ isActive: true });
    expect(searchByStatus).toHaveLength(1);
    expect(searchByStatus[0].status).toBe(UserIsActive.ATIVO);
  });
});
