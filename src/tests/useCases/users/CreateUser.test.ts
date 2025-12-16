import { beforeEach, describe, expect, it } from "vitest";

import { CreateUser } from "../../../core/useCases/users/Create";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { BcryptHashService } from "../../../infra/services/BcryptHashService";
import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";
import { UserIsActive, UserRole } from "../../../types/user";

describe("CreateUser UseCase", () => {
  let createUser: CreateUser;
  let userRepo: UserRepositoryInMemory;
  let hashService: BcryptHashService;
  let uuidGenerator: CryptoUuidGenerator;

  beforeEach(() => {
    userRepo = new UserRepositoryInMemory();
    hashService = new BcryptHashService();
    uuidGenerator = new CryptoUuidGenerator();
    createUser = new CreateUser(userRepo, hashService, uuidGenerator);
  });

  it("deve criar usuário com sucesso", async () => {
    const input = {
      name: "Test User",
      email: "test@example.com",
      phone: "11999999999",
      password: "password123",
    };

    await createUser.execute(input);

    const user = await userRepo.findByEmail("test@example.com");

    expect(user).toBeDefined();
    expect(user?.name).toBe("Test User");
    expect(user?.email).toBe("test@example.com");
    expect(user?.phone).toBe("11999999999");
    expect(user?.password).not.toBe("password123"); // Deve estar hasheada
    expect(user?.role).toBe(UserRole.PROPRIETARIO); // Default role
    expect(user?.checked).toBe(false);
  });

  it("deve lançar erro ao tentar criar usuário com email já existente", async () => {
    const input = {
      name: "Test User",
      email: "duplicate@example.com",
      phone: "11999999999",
      password: "password123",
    };

    await createUser.execute(input);

    await expect(createUser.execute(input)).rejects.toThrow("email already exists");
  });

  it("deve criar usuário com role customizada", async () => {
    const input = {
      name: "Admin User",
      email: "admin@example.com",
      phone: "11999999999",
      password: "password123",
      role: UserRole.CLIENTE,
    };

    await createUser.execute(input);

    const user = await userRepo.findByEmail("admin@example.com");

    expect(user?.role).toBe(UserRole.CLIENTE);
  });

  it("deve hashear a senha do usuário", async () => {
    const input = {
      name: "Test User",
      email: "hash@example.com",
      phone: "11999999999",
      password: "plainPassword",
    };

    await createUser.execute(input);

    const user = await userRepo.findByEmail("hash@example.com");

    expect(user?.password).not.toBe("plainPassword");
    expect(user?.password).toBeDefined();
    expect(user?.password.length).toBeGreaterThan(20); // Hash bcrypt é longo
  });

  it("deve gerar ID único para cada usuário", async () => {
    const input1 = {
      name: "User 1",
      email: "user1@example.com",
      phone: "11999999999",
      password: "password123",
    };

    const input2 = {
      name: "User 2",
      email: "user2@example.com",
      phone: "11999999999",
      password: "password123",
    };

    await createUser.execute(input1);
    await createUser.execute(input2);

    const user1 = await userRepo.findByEmail("user1@example.com");
    const user2 = await userRepo.findByEmail("user2@example.com");

    expect(user1?.id).toBeDefined();
    expect(user2?.id).toBeDefined();
    expect(user1?.id).not.toBe(user2?.id);
  });

  it("deve criar usuário com status ATIVO por padrão", async () => {
    const input = {
      name: "Test User",
      email: "status@example.com",
      phone: "11999999999",
      password: "password123",
    };

    await createUser.execute(input);

    const user = await userRepo.findByEmail("status@example.com");

    expect(user?.status).toBe(UserIsActive.ATIVO);
  });
});
