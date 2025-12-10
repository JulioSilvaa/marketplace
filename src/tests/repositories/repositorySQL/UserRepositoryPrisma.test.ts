import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { UserRepositoryPrisma } from "../../../infra/repositories/UserRepositoryPrisma";

import { IUser, UserRole, UserIsActive } from "../../../types/user";
import { prisma } from "../../../lib/prisma";

describe("UserRepositoryPrisma (Integration)", () => {
  let userRepository: UserRepositoryPrisma;

  beforeAll(() => {
    userRepository = new UserRepositoryPrisma();
  });

  beforeEach(async () => {
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
  });

  afterAll(async () => {
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
});
