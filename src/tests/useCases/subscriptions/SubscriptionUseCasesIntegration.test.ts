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
      await prisma.$transaction(async tx => {
        // Instantiate repositories with transaction client
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        // Primeiro criar usuário
        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `sub-${Date.now()}@test.com`;
        await createUser.execute({
          name: "Subscription User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);
        expect(user).toBeDefined();

        // 2. Criar assinatura
        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );
        const subscription = await createSubscription.execute({
          user_id: user!.id,
          plan: "Basic",
          price: 29.9,
        });

        // 3. Verificar se foi criada
        const foundSubscription = await txSubscriptionRepository.findById(subscription.id!);

        expect(foundSubscription).not.toBeNull();
        expect(foundSubscription?.user_id).toBe(user!.id);
        expect(foundSubscription?.status).toBe(SubscriptionStatus.TRIAL);

        // Force rollback to keep DB clean (optional, but good for tests)
        // throw new Error("Rollback needed");
      });
    });

    it("deve criar assinatura com status TRIAL por padrão", async () => {
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `trial-${Date.now()}@test.com`;
        await createUser.execute({
          name: "Trial User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);

        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );
        const subscription = await createSubscription.execute({
          user_id: user!.id,
          plan: "Premium",
        });

        expect(subscription.status).toBe(SubscriptionStatus.TRIAL);
        expect(subscription.price).toBe(30.0); // Default price
      });
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
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `duplicate-sub-${Date.now()}@test.com`;
        await createUser.execute({
          name: "Duplicate Sub User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);

        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );
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
  });

  describe("FindByUserIdSubscription (Integration)", () => {
    it("deve buscar assinatura por user_id", async () => {
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `findsub-${Date.now()}@test.com`;
        await createUser.execute({
          name: "Find Sub User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);

        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );
        await createSubscription.execute({
          user_id: user!.id,
          plan: "Basic",
          price: 19.99,
        });

        const findByUserId = new FindByUserIdSubscription(txSubscriptionRepository);
        const subscription = await findByUserId.execute(user!.id);

        expect(subscription).toBeDefined();
        expect(subscription?.user_id).toBe(user!.id);
        expect(subscription?.plan).toBe("Basic");
      });
    });

    it("deve retornar null para usuário sem assinatura", async () => {
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `nosub-${Date.now()}@test.com`;
        await createUser.execute({
          name: "No Sub User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);

        const findByUserId = new FindByUserIdSubscription(txSubscriptionRepository);
        const subscription = await findByUserId.execute(user!.id);

        expect(subscription).toBeNull();
      });
    });
  });

  describe("FindAllSubscriptions (Integration)", () => {
    it("deve listar todas as assinaturas", async () => {
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );

        const email1 = `user1-${Date.now()}@test.com`;
        const email2 = `user2-${Date.now()}@test.com`;

        await createUser.execute({
          name: "User 1",
          email: email1,
          phone: "11999999999",
          password: "password123",
        });

        await createUser.execute({
          name: "User 2",
          email: email2,
          phone: "11999999999",
          password: "password123",
        });

        const user1 = await txUserRepository.findByEmail(email1);
        const user2 = await txUserRepository.findByEmail(email2);

        await createSubscription.execute({
          user_id: user1!.id,
          plan: "Basic",
        });

        await createSubscription.execute({
          user_id: user2!.id,
          plan: "Premium",
        });

        const findAll = new FindAllSubscriptions(txSubscriptionRepository);
        const subscriptions = await findAll.execute();

        // Note: Since deleteMany might not be reliable outside transaction, we check if length >= 2 or exact 2 if we trust transaction isolation
        expect(subscriptions.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("deve retornar array vazio quando não há assinaturas", async () => {
      const findAll = new FindAllSubscriptions(subscriptionRepository);
      const subscriptions = await findAll.execute();

      expect(subscriptions).toEqual([]);
    });
  });

  describe("UpdateSubscription (Integration)", () => {
    it("deve atualizar plano e preço da assinatura", async () => {
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `updatesub-${Date.now()}@test.com`;
        await createUser.execute({
          name: "Update Sub User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);

        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );
        const subscription = await createSubscription.execute({
          user_id: user!.id,
          plan: "Basic",
          price: 19.99,
        });

        const updateSubscription = new UpdateSubscription(txSubscriptionRepository);
        await updateSubscription.execute({
          id: subscription.id!,
          plan: "Premium",
          price: 49.99,
        });

        const updated = await txSubscriptionRepository.findById(subscription.id!);

        expect(updated?.plan).toBe("Premium");
        expect(updated?.price).toBe(49.99);
      });
    });

    it("deve ativar assinatura (TRIAL → ACTIVE)", async () => {
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `activate-${Date.now()}@test.com`;
        await createUser.execute({
          name: "Activate User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);

        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );
        const subscription = await createSubscription.execute({
          user_id: user!.id,
          plan: "Basic",
        });

        expect(subscription.status).toBe(SubscriptionStatus.TRIAL);

        const updateSubscription = new UpdateSubscription(txSubscriptionRepository);
        await updateSubscription.execute({
          id: subscription.id!,
          status: SubscriptionStatus.ACTIVE,
        });

        const updated = await txSubscriptionRepository.findById(subscription.id!);

        expect(updated?.status).toBe(SubscriptionStatus.ACTIVE);
      });
    });

    it("deve suspender assinatura (ACTIVE → SUSPENDED)", async () => {
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `suspend-${Date.now()}@test.com`;
        await createUser.execute({
          name: "Suspend User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);

        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );
        const subscription = await createSubscription.execute({
          user_id: user!.id,
          plan: "Basic",
          status: SubscriptionStatus.ACTIVE,
        });

        const updateSubscription = new UpdateSubscription(txSubscriptionRepository);
        await updateSubscription.execute({
          id: subscription.id!,
          status: SubscriptionStatus.SUSPENDED,
        });

        const updated = await txSubscriptionRepository.findById(subscription.id!);

        expect(updated?.status).toBe(SubscriptionStatus.SUSPENDED);
      });
    });

    it("deve cancelar assinatura manual", async () => {
      await prisma.$transaction(async tx => {
        const txUserRepository = new UserRepositoryPrisma(tx);
        const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

        const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
        const email = `cancel-${Date.now()}@test.com`;
        await createUser.execute({
          name: "Cancel User",
          email,
          phone: "11999999999",
          password: "password123",
        });

        const user = await txUserRepository.findByEmail(email);

        const createSubscription = new CreateSubscription(
          txSubscriptionRepository,
          txUserRepository
        );
        const subscription = await createSubscription.execute({
          user_id: user!.id,
          plan: "Basic",
          status: SubscriptionStatus.ACTIVE,
        });

        const updateSubscription = new UpdateSubscription(txSubscriptionRepository);
        await updateSubscription.execute({
          id: subscription.id!,
          status: SubscriptionStatus.CANCELLED,
        });

        const updated = await txSubscriptionRepository.findById(subscription.id!);

        expect(updated?.status).toBe(SubscriptionStatus.CANCELLED);
      });
    });

    describe("Fluxo End-to-End: Ciclo de Vida da Assinatura", () => {
      it("Criar usuário → Criar assinatura TRIAL → Ativar → Suspender", async () => {
        await prisma.$transaction(async tx => {
          const txUserRepository = new UserRepositoryPrisma(tx);
          const txSubscriptionRepository = new SubscriptionRepositoryPrisma(tx);

          const createUser = new CreateUser(txUserRepository, hashService, uuidGenerator);
          const createSubscription = new CreateSubscription(
            txSubscriptionRepository,
            txUserRepository
          );
          const updateSubscription = new UpdateSubscription(txSubscriptionRepository);
          const findByUserId = new FindByUserIdSubscription(txSubscriptionRepository);

          // 1. Criar usuário
          const email = `lifecycle-${Date.now()}@test.com`;
          await createUser.execute({
            name: "Lifecycle User",
            email,
            phone: "11999999999",
            password: "password123",
          });

          const user = await txUserRepository.findByEmail(email);
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

          const activeSub = await txSubscriptionRepository.findById(subscription.id!);
          expect(activeSub?.status).toBe(SubscriptionStatus.ACTIVE);

          // 4. Upgrade de plano
          await updateSubscription.execute({
            id: subscription.id!,
            plan: "Premium",
            price: 49.99,
          });

          const upgradedSub = await findByUserId.execute(user!.id);
          expect(upgradedSub?.plan).toBe("Premium");
          expect(upgradedSub?.price).toBe(49.99);

          // 5. Suspender assinatura
          await updateSubscription.execute({
            id: subscription.id!,
            status: SubscriptionStatus.SUSPENDED,
          });

          const suspendedSub = await findByUserId.execute(user!.id);
          expect(suspendedSub?.status).toBe(SubscriptionStatus.SUSPENDED);
        });
      });
    });
  });
});
