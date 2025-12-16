/// <reference path="../../../@types/express/index.d.ts" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { UserRepositoryPrisma } from "../../../infra/repositories/sql/UserRepositoryPrisma";
import { BcryptHashService } from "../../../infra/services/BcryptHashService";
import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";
import { CreateUser } from "../../../core/useCases/users/Create";
import { FindByIdUser } from "../../../core/useCases/users/FindById";
import { FindAllUsers } from "../../../core/useCases/users/FindAll";
import { UpdateUser } from "../../../core/useCases/users/Update";
import { DeleteUser } from "../../../core/useCases/users/Delete";
import { SearchUser } from "../../../core/useCases/users/Search";
import { IUser, UserRole, UserIsActive } from "../../../types/user";

describe("User Use Cases (Integration)", () => {
  let userRepository: UserRepositoryPrisma;
  let hashService: BcryptHashService;
  let uuidGenerator: CryptoUuidGenerator;

  beforeAll(async () => {
    // Limpar banco de dados
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
  });

  beforeEach(async () => {
    // Limpar entre cada teste para evitar conflitos
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});

    userRepository = new UserRepositoryPrisma();
    hashService = new BcryptHashService();
    uuidGenerator = new CryptoUuidGenerator();
  });

  afterAll(async () => {
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.$disconnect();
  });

  describe("CreateUser (Integration)", () => {
    it("deve criar usuário no banco de dados", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);

      await createUser.execute({
        name: "Integration Test User",
        email: "integration@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("integration@test.com");

      expect(user).toBeDefined();
      expect(user?.name).toBe("Integration Test User");
      expect(user?.email).toBe("integration@test.com");
      expect(user?.role).toBe(UserRole.PROPRIETARIO);
      expect(user?.status).toBe(UserIsActive.ATIVO);
    });

    it("deve impedir criação de usuário com email duplicado", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);

      await createUser.execute({
        name: "User 1",
        email: "duplicate@test.com",
        phone: "11999999999",
        password: "password123",
      });

      await expect(
        createUser.execute({
          name: "User 2",
          email: "duplicate@test.com",
          phone: "11999999999",
          password: "password123",
        })
      ).rejects.toThrow("email already exists");
    });
  });

  describe("FindByIdUser (Integration)", () => {
    it("deve buscar usuário por ID", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      const findByIdUser = new FindByIdUser(userRepository);

      await createUser.execute({
        name: "Find Test",
        email: "find@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const createdUser = await userRepository.findByEmail("find@test.com");
      const foundUser = await findByIdUser.execute(createdUser!.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe("find@test.com");
    });

    it("deve retornar null para ID inexistente", async () => {
      const findByIdUser = new FindByIdUser(userRepository);
      const user = await findByIdUser.execute("non-existent-id");

      expect(user).toBeNull();
    });
  });

  describe("FindAllUsers (Integration)", () => {
    it("deve listar todos os usuários", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      const findAllUsers = new FindAllUsers(userRepository);

      await createUser.execute({
        name: "User 1",
        email: "user1@test.com",
        phone: "11999999999",
        password: "password123",
      });

      await createUser.execute({
        name: "User 2",
        email: "user2@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const users = await findAllUsers.execute();

      expect(users).toHaveLength(2);
      expect(users.map(u => u.email)).toContain("user1@test.com");
      expect(users.map(u => u.email)).toContain("user2@test.com");
    });

    it("deve retornar array vazio quando não há usuários", async () => {
      const findAllUsers = new FindAllUsers(userRepository);
      const users = await findAllUsers.execute();

      expect(users).toEqual([]);
    });
  });

  describe("SearchUser (Integration)", () => {
    beforeEach(async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);

      await createUser.execute({
        name: "João Silva",
        email: "joao@test.com",
        phone: "11999999999",
        password: "password123",
      });

      await createUser.execute({
        name: "Maria Santos",
        email: "maria@test.com",
        phone: "11999999999",
        password: "password123",
      });
    });

    it("deve buscar usuários por nome", async () => {
      const searchUser = new SearchUser(userRepository);
      const users = await searchUser.execute({ name: "João" });

      expect(users).toHaveLength(1);
      expect(users[0].name).toBe("João Silva");
    });

    it("deve buscar usuários por email", async () => {
      const searchUser = new SearchUser(userRepository);
      const users = await searchUser.execute({ email: "maria@test.com" });

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe("maria@test.com");
    });

    it("deve retornar array vazio quando não encontra resultados", async () => {
      const searchUser = new SearchUser(userRepository);
      const users = await searchUser.execute({ name: "Inexistente" });

      expect(users).toEqual([]);
    });
  });

  describe("UpdateUser (Integration)", () => {
    it("deve atualizar dados do usuário", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      const updateUser = new UpdateUser(userRepository);

      await createUser.execute({
        name: "Old Name",
        email: "update@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("update@test.com");

      await updateUser.execute({
        id: user!.id,
        name: "New Name",
        phone: "11888888888",
      });

      const updatedUser = await userRepository.findById(user!.id);

      expect(updatedUser?.name).toBe("New Name");
      expect(updatedUser?.phone).toBe("11888888888");
      expect(updatedUser?.email).toBe("update@test.com"); // Não alterado
    });

    it("deve lançar erro ao tentar atualizar usuário inexistente", async () => {
      const updateUser = new UpdateUser(userRepository);

      await expect(
        updateUser.execute({
          id: "non-existent-id",
          name: "New Name",
        })
      ).rejects.toThrow("User not found");
    });
  });

  describe("DeleteUser (Integration)", () => {
    it("deve deletar usuário do banco de dados", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      const deleteUser = new DeleteUser(userRepository);

      await createUser.execute({
        name: "Delete Test",
        email: "delete@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("delete@test.com");
      expect(user).toBeDefined();

      await deleteUser.execute({ id: user!.id });

      const deletedUser = await userRepository.findById(user!.id);
      expect(deletedUser).toBeNull();
    });

    it("deve lançar erro ao tentar deletar usuário inexistente", async () => {
      const deleteUser = new DeleteUser(userRepository);

      await expect(deleteUser.execute({ id: "non-existent-id" })).rejects.toThrow("User not found");
    });
  });

  describe("Fluxo End-to-End: CRUD Completo", () => {
    it("Criar → Buscar → Atualizar → Deletar usuário", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      const findByIdUser = new FindByIdUser(userRepository);
      const updateUser = new UpdateUser(userRepository);
      const deleteUser = new DeleteUser(userRepository);

      // 1. Criar usuário
      await createUser.execute({
        name: "E2E User",
        email: "e2e@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const createdUser = await userRepository.findByEmail("e2e@test.com");
      expect(createdUser).toBeDefined();

      // 2. Buscar usuário
      const foundUser = await findByIdUser.execute(createdUser!.id);
      expect(foundUser?.email).toBe("e2e@test.com");

      // 3. Atualizar usuário
      await updateUser.execute({
        id: createdUser!.id,
        name: "E2E User Updated",
        phone: "11888888888",
      });

      const updatedUser = await userRepository.findById(createdUser!.id);
      expect(updatedUser?.name).toBe("E2E User Updated");
      expect(updatedUser?.phone).toBe("11888888888");

      // 4. Deletar usuário
      await deleteUser.execute({ id: createdUser!.id });

      const deletedUser = await userRepository.findById(createdUser!.id);
      expect(deletedUser).toBeNull();
    });
  });
});
