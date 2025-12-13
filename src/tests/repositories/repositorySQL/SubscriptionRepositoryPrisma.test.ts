import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { SubscriptionRepositoryPrisma } from "../../../infra/repositories/sql/SubscriptionRepositoryPrisma";
import { UserRepositoryPrisma } from "../../../infra/repositories/sql/UserRepositoryPrisma";
import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";

import { SubscriptionStatus } from "../../../types/Subscription";
import { UserIsActive, UserRole } from "../../../types/user";
import { prisma } from "../../../lib/prisma";

describe("SubscriptionRepositoryPrisma (Integration)", () => {
  let subRepository: SubscriptionRepositoryPrisma;
  let userRepository: UserRepositoryPrisma;
  const uuidGenerator = new CryptoUuidGenerator();
  let testUserId1: string;
  let testUserId2: string;

  beforeAll(async () => {
    // Clean up before tests - delete in correct order for foreign keys
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});

    // Create test users for foreign key constraints
    userRepository = new UserRepositoryPrisma();

    testUserId1 = uuidGenerator.generate();
    await userRepository.create({
      id: testUserId1,
      name: "Test User 1",
      email: "user1@test.com",
      phone: "1111111111",
      password: "hashed_password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    });

    testUserId2 = uuidGenerator.generate();
    await userRepository.create({
      id: testUserId2,
      name: "Test User 2",
      email: "user2@test.com",
      phone: "2222222222",
      password: "hashed_password",
      role: UserRole.CLIENTE,
      checked: true,
      status: UserIsActive.ATIVO,
    });
  });

  beforeEach(async () => {
    // Clean only subscriptions and spaces between tests, keep users
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    subRepository = new SubscriptionRepositoryPrisma();
  });

  afterAll(async () => {
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.$disconnect();
  });

  it("should create a subscription", async () => {
    const sub = SubscriptionEntity.create({
      id: "sub-1",
      user_id: testUserId1,
      plan: "Pro",
      price: 50.0,
      status: "ACTIVE" as SubscriptionStatus,
    });

    await subRepository.create(sub);

    const savedSub = await prisma.subscriptions.findUnique({ where: { id: sub.id } });
    expect(savedSub).toBeDefined();
    expect(savedSub?.plan).toBe("Pro");
    expect(savedSub?.status).toBe("ACTIVE");
  });

  it("should find subscription by user id", async () => {
    const sub = SubscriptionEntity.create({
      id: "sub-2",
      user_id: testUserId1,
      plan: "Basic",
      price: 20.0,
      status: "TRIAL" as SubscriptionStatus,
    });
    await subRepository.create(sub);

    const foundSub = await subRepository.findByUserId(testUserId1);
    expect(foundSub).toBeDefined();
    expect(foundSub?.id).toBe(sub.id);
    expect(foundSub?.plan).toBe("Basic");
  });

  it("should update a subscription", async () => {
    const sub = SubscriptionEntity.create({
      id: "sub-3",
      user_id: testUserId1,
      plan: "Basic",
      price: 20.0,
      status: "ACTIVE" as SubscriptionStatus,
    });
    await subRepository.create(sub);

    sub.changePlan("Premium", 100.0);

    await subRepository.update(sub);

    const updatedSub = await prisma.subscriptions.findUnique({ where: { id: sub.id } });
    expect(updatedSub?.plan).toBe("Premium");
    expect(updatedSub?.price).toBe(100.0);
  });

  it("should find subscription by id", async () => {
    const subscription = SubscriptionEntity.create({
      id: uuidGenerator.generate(),
      user_id: testUserId1,
      plan: "premium",
      price: 50,
      status: SubscriptionStatus.ACTIVE,
    });

    const created = await subRepository.create(subscription);

    const found = await subRepository.findById(created.id!);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.user_id).toBe(testUserId1);
    expect(found?.plan).toBe("premium");
  });

  it("should return null when subscription not found by id", async () => {
    const found = await subRepository.findById("non-existent-id");
    expect(found).toBeNull();
  });

  it("should find all subscriptions", async () => {
    const sub1 = SubscriptionEntity.create({
      id: uuidGenerator.generate(),
      user_id: testUserId1,
      plan: "basic",
      price: 30,
      status: SubscriptionStatus.ACTIVE,
    });

    const sub2 = SubscriptionEntity.create({
      id: uuidGenerator.generate(),
      user_id: testUserId2,
      plan: "premium",
      price: 50,
      status: SubscriptionStatus.TRIAL,
    });

    await subRepository.create(sub1);
    await subRepository.create(sub2);

    const allSubs = await subRepository.findAll();

    expect(allSubs.length).toBeGreaterThanOrEqual(2);
    const userIds = allSubs.map(s => s.user_id);
    expect(userIds).toContain(testUserId1);
    expect(userIds).toContain(testUserId2);
  });
});
