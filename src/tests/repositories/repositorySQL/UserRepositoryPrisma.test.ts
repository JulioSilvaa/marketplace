import { UserRepositoryPrisma } from "./../../../infra/repositories/sql/UserRepositoryPrisma";

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import { IUser, UserRole, UserIsActive } from "../../../types/user";
import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";
import { prisma } from "../../../lib/prisma";

describe("UserRepositoryPrisma (Integration)", () => {
  let userRepository: UserRepositoryPrisma;
  const uuidGenerator = new CryptoUuidGenerator();

  beforeAll(async () => {
    // Clean up before tests - delete in correct order for foreign keys
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
  });

  beforeEach(async () => {
    // Clean data between tests to avoid conflicts
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
    userRepository = new UserRepositoryPrisma();
  });

  afterAll(async () => {
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.$disconnect();
  });

  it("should create a user", async () => {
    const userData: IUser = {
      id: "user-test-1",
      email: "create@test.com",
      name: "Create User",
      password: "hashedpassword",
      phone: "111222333",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await userRepository.create(userData);

    const savedUser = await prisma.users.findUnique({ where: { id: userData.id } });
    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe(userData.email);
  });

  it("should find by email", async () => {
    const userData: IUser = {
      id: "user-test-2",
      email: "find@test.com",
      name: "Find User",
      password: "hashedpassword",
      phone: "444555666",
      role: UserRole.PROPRIETARIO,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    // Directly inserting via prisma to test the find method
    await prisma.users.create({
      data: {
        id: userData.id!,
        email: userData.email,
        name: userData.name,
        password: userData.password,
        phone: userData.phone,
        role: userData.role,
        checked: userData.checked,
        status: userData.status,
      },
    });

    const foundUser = await userRepository.findByEmail(userData.email);
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(userData.id);
  });

  it("should find by id", async () => {
    const userData: IUser = {
      id: "user-test-3",
      email: "findid@test.com",
      name: "Find ID User",
      password: "hashedpassword",
      phone: "777888999",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };

    await userRepository.create(userData);

    const foundUser = await userRepository.findById(userData.id!);
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(userData.email);
  });

  it("should update a user", async () => {
    const userData: IUser = {
      id: "user-update-1",
      email: "update@test.com",
      name: "Original Name",
      password: "pass",
      phone: "000",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };
    await userRepository.create(userData);

    await userRepository.update(userData.id!, { name: "Updated Name" });

    const updatedUser = await prisma.users.findUnique({ where: { id: userData.id } });
    expect(updatedUser?.name).toBe("Updated Name");
  });

  it("should delete a user", async () => {
    const userData: IUser = {
      id: "user-delete-1",
      email: "delete@test.com",
      name: "To Delete",
      password: "pass",
      phone: "111",
      role: UserRole.CLIENTE,
      checked: false,
      status: UserIsActive.ATIVO,
    };
    await userRepository.create(userData);

    await userRepository.delete(userData.id!);

    const deletedUser = await prisma.users.findUnique({ where: { id: userData.id } });
    expect(deletedUser).toBeNull();
  });

  it("should find all users", async () => {
    const user1 = {
      id: uuidGenerator.generate(),
      name: "User 1 FindAll",
      email: "findall1@test.com",
      phone: "1111111111",
      password: "hashed_password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    const user2 = {
      id: uuidGenerator.generate(),
      name: "User 2 FindAll",
      email: "findall2@test.com",
      phone: "2222222222",
      password: "hashed_password",
      role: UserRole.PROPRIETARIO,
      checked: false,
      status: UserIsActive.INATIVO,
    };

    await userRepository.create(user1);
    await userRepository.create(user2);

    const allUsers = await userRepository.findAll();

    expect(allUsers.length).toBeGreaterThanOrEqual(2);
    const emails = allUsers.map(u => u.email);
    expect(emails).toContain("findall1@test.com");
    expect(emails).toContain("findall2@test.com");
  });

  it("should search users by filters", async () => {
    const user1 = {
      id: uuidGenerator.generate(),
      name: "John Search",
      email: "john.search@test.com",
      phone: "3333333333",
      password: "hashed_password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    };

    const user2 = {
      id: uuidGenerator.generate(),
      name: "Jane Search",
      email: "jane.search@test.com",
      phone: "4444444444",
      password: "hashed_password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.INATIVO,
    };

    await userRepository.create(user1);
    await userRepository.create(user2);

    // Search by name
    const searchByName = await userRepository.search({ name: "John" });
    expect(searchByName.length).toBeGreaterThanOrEqual(1);
    expect(searchByName.some(u => u.name === "John Search")).toBe(true);

    // Search by email
    const searchByEmail = await userRepository.search({
      email: "jane.search@test.com",
    });
    expect(searchByEmail.length).toBeGreaterThanOrEqual(1);
    expect(searchByEmail.some(u => u.email === "jane.search@test.com")).toBe(true);
  });
});
