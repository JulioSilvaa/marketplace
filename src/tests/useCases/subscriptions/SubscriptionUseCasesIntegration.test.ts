/// <reference path="../../../@types/express/index.d.ts" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { UserRepositoryPrisma } from "../../../infra/repositories/sql/UserRepositoryPrisma";
import { SubscriptionRepositoryPrisma } from "../../../infra/repositories/sql/SubscriptionRepositoryPrisma";
import { BcryptHashService } from "../../../infra/services/BcryptHashService";
import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";
import { CreateUser } from "../../../core/useCases/users/Create";
import { CreateSubscription } from "../../../core/useCases/subscriptions/Create";
import { FindByUserIdSubscription } from "../../../core/useCases/subscriptions/FindByUserId";
import { FindAllSubscriptions } from "../../../core/useCases/subscriptions/FindAll";
import { UpdateSubscription } from "../../../core/useCases/subscriptions/Update";
import { SubscriptionStatus } from "../../../types/Subscription";
import { UserRole, UserIsActive } from "../../../types/user";

describe("Subscription Use Cases (Integration)", () => {
  let userRepository: UserRepositoryPrisma;
  let subscriptionRepository: SubscriptionRepositoryPrisma;
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
    subscriptionRepository = new SubscriptionRepositoryPrisma();
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

  describe("CreateSubscription (Integration)", () => {
    it("deve criar assinatura no banco de dados", async () => {
      // Primeiro criar usuário
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      await createUser.execute({
        name: "Subscription User",
        email: "sub@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("sub@test.com");

      // Criar assinatura
      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);
      const subscription = await createSubscription.execute({
        user_id: user!.id,
        plan: "Basic",
        price: 29.99,
      });

      expect(subscription).toBeDefined();
      expect(subscription.user_id).toBe(user!.id);
      expect(subscription.plan).toBe("Basic");
      expect(subscription.price).toBe(29.99);
      expect(subscription.status).toBe(SubscriptionStatus.TRIAL);
    });

    it("deve criar assinatura com status TRIAL por padrão", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      await createUser.execute({
        name: "Trial User",
        email: "trial@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("trial@test.com");

      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);
      const subscription = await createSubscription.execute({
        user_id: user!.id,
        plan: "Premium",
      });

      expect(subscription.status).toBe(SubscriptionStatus.TRIAL);
      expect(subscription.price).toBe(30.0); // Default price
    });

    it("deve lançar erro ao tentar criar assinatura para usuário inexistente", async () => {
      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);

      await expect(
        createSubscription.execute({
          user_id: "non-existent-user-id",
          plan: "Basic",
        })
      ).rejects.toThrow("User not found");
    });

    it("deve lançar erro ao tentar criar segunda assinatura para mesmo usuário", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      await createUser.execute({
        name: "Duplicate Sub User",
        email: "duplicate-sub@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("duplicate-sub@test.com");

      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);
      await createSubscription.execute({
        user_id: user!.id,
        plan: "Basic",
      });

      await expect(
        createSubscription.execute({
          user_id: user!.id,
          plan: "Premium",
        })
      ).rejects.toThrow("User already has a subscription");
    });
  });

  describe("FindByUserIdSubscription (Integration)", () => {
    it("deve buscar assinatura por user_id", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      await createUser.execute({
        name: "Find Sub User",
        email: "findsub@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("findsub@test.com");

      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);
      await createSubscription.execute({
        user_id: user!.id,
        plan: "Basic",
        price: 19.99,
      });

      const findByUserId = new FindByUserIdSubscription(subscriptionRepository);
      const subscription = await findByUserId.execute(user!.id);

      expect(subscription).toBeDefined();
      expect(subscription?.user_id).toBe(user!.id);
      expect(subscription?.plan).toBe("Basic");
    });

    it("deve retornar null para usuário sem assinatura", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      await createUser.execute({
        name: "No Sub User",
        email: "nosub@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("nosub@test.com");

      const findByUserId = new FindByUserIdSubscription(subscriptionRepository);
      const subscription = await findByUserId.execute(user!.id);

      expect(subscription).toBeNull();
    });
  });

  describe("FindAllSubscriptions (Integration)", () => {
    it("deve listar todas as assinaturas", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);

      // Criar 2 usuários com assinaturas
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

      const user1 = await userRepository.findByEmail("user1@test.com");
      const user2 = await userRepository.findByEmail("user2@test.com");

      await createSubscription.execute({
        user_id: user1!.id,
        plan: "Basic",
      });

      await createSubscription.execute({
        user_id: user2!.id,
        plan: "Premium",
      });

      const findAll = new FindAllSubscriptions(subscriptionRepository);
      const subscriptions = await findAll.execute();

      expect(subscriptions).toHaveLength(2);
    });

    it("deve retornar array vazio quando não há assinaturas", async () => {
      const findAll = new FindAllSubscriptions(subscriptionRepository);
      const subscriptions = await findAll.execute();

      expect(subscriptions).toEqual([]);
    });
  });

  describe("UpdateSubscription (Integration)", () => {
    it("deve atualizar plano e preço da assinatura", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      await createUser.execute({
        name: "Update Sub User",
        email: "updatesub@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("updatesub@test.com");

      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);
      const subscription = await createSubscription.execute({
        user_id: user!.id,
        plan: "Basic",
        price: 19.99,
      });

      const updateSubscription = new UpdateSubscription(subscriptionRepository);
      await updateSubscription.execute({
        id: subscription.id!,
        plan: "Premium",
        price: 49.99,
      });

      const updated = await subscriptionRepository.findById(subscription.id!);

      expect(updated?.plan).toBe("Premium");
      expect(updated?.price).toBe(49.99);
    });

    it("deve ativar assinatura (TRIAL → ACTIVE)", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      await createUser.execute({
        name: "Activate User",
        email: "activate@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("activate@test.com");

      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);
      const subscription = await createSubscription.execute({
        user_id: user!.id,
        plan: "Basic",
      });

      expect(subscription.status).toBe(SubscriptionStatus.TRIAL);

      const updateSubscription = new UpdateSubscription(subscriptionRepository);
      await updateSubscription.execute({
        id: subscription.id!,
        status: SubscriptionStatus.ACTIVE,
      });

      const updated = await subscriptionRepository.findById(subscription.id!);

      expect(updated?.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it("deve suspender assinatura (ACTIVE → SUSPENDED)", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      await createUser.execute({
        name: "Suspend User",
        email: "suspend@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("suspend@test.com");

      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);
      const subscription = await createSubscription.execute({
        user_id: user!.id,
        plan: "Basic",
        status: SubscriptionStatus.ACTIVE,
      });

      const updateSubscription = new UpdateSubscription(subscriptionRepository);
      await updateSubscription.execute({
        id: subscription.id!,
        status: SubscriptionStatus.SUSPENDED,
      });

      const updated = await subscriptionRepository.findById(subscription.id!);

      expect(updated?.status).toBe(SubscriptionStatus.SUSPENDED);
    });

    it("deve lançar erro ao tentar atualizar assinatura inexistente", async () => {
      const updateSubscription = new UpdateSubscription(subscriptionRepository);

      await expect(
        updateSubscription.execute({
          id: "non-existent-id",
          plan: "Premium",
        })
      ).rejects.toThrow("Subscription not found");
    });
  });

  describe("Fluxo End-to-End: Ciclo de Vida da Assinatura", () => {
    it("Criar usuário → Criar assinatura TRIAL → Ativar → Suspender", async () => {
      const createUser = new CreateUser(userRepository, hashService, uuidGenerator);
      const createSubscription = new CreateSubscription(subscriptionRepository, userRepository);
      const updateSubscription = new UpdateSubscription(subscriptionRepository);
      const findByUserId = new FindByUserIdSubscription(subscriptionRepository);

      // 1. Criar usuário
      await createUser.execute({
        name: "Lifecycle User",
        email: "lifecycle@test.com",
        phone: "11999999999",
        password: "password123",
      });

      const user = await userRepository.findByEmail("lifecycle@test.com");
      expect(user).toBeDefined();

      // 2. Criar assinatura em TRIAL
      const subscription = await createSubscription.execute({
        user_id: user!.id,
        plan: "Basic",
        price: 29.99,
      });

      expect(subscription.status).toBe(SubscriptionStatus.TRIAL);

      // 3. Ativar assinatura
      await updateSubscription.execute({
        id: subscription.id!,
        status: SubscriptionStatus.ACTIVE,
      });

      let currentSub = await findByUserId.execute(user!.id);
      expect(currentSub?.status).toBe(SubscriptionStatus.ACTIVE);

      // 4. Upgrade de plano
      await updateSubscription.execute({
        id: subscription.id!,
        plan: "Premium",
        price: 49.99,
      });

      currentSub = await findByUserId.execute(user!.id);
      expect(currentSub?.plan).toBe("Premium");
      expect(currentSub?.price).toBe(49.99);

      // 5. Suspender assinatura
      await updateSubscription.execute({
        id: subscription.id!,
        status: SubscriptionStatus.SUSPENDED,
      });

      currentSub = await findByUserId.execute(user!.id);
      expect(currentSub?.status).toBe(SubscriptionStatus.SUSPENDED);
    });
  });
});
