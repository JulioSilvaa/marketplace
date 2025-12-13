import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { SubscriptionRepositoryPrisma } from "../../../infra/repositories/sql/SubscriptionRepositoryPrisma";

import { SubscriptionStatus } from "../../../types/Subscription";
import { prisma } from "../../../lib/prisma";

describe("SubscriptionRepositoryPrisma (Integration)", () => {
  let subRepository: SubscriptionRepositoryPrisma;

  beforeAll(() => {
    subRepository = new SubscriptionRepositoryPrisma();
  });

  beforeEach(async () => {
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const createTestUser = async (id: string) => {
    await prisma.users.create({
      data: {
        id,
        email: `sub-${id}@test.com`,
        name: "Sub User",
        password: "pass",
        phone: "123",
        role: 0,
        status: 0,
        checked: true,
      },
    });
  };

  it("should create a subscription", async () => {
    const userId = "user-sub-1";
    await createTestUser(userId);

    const sub = SubscriptionEntity.create({
      id: "sub-1",
      user_id: userId,
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
    const userId = "user-sub-2";
    await createTestUser(userId);

    const sub = SubscriptionEntity.create({
      id: "sub-2",
      user_id: userId,
      plan: "Basic",
      price: 20.0,
      status: "TRIAL" as SubscriptionStatus,
    });
    await subRepository.create(sub);

    const foundSub = await subRepository.findByUserId(userId);
    expect(foundSub).toBeDefined();
    expect(foundSub?.id).toBe(sub.id);
    expect(foundSub?.plan).toBe("Basic");
  });

  it("should update a subscription", async () => {
    const userId = "user-sub-3";
    await createTestUser(userId);

    const sub = SubscriptionEntity.create({
      id: "sub-3",
      user_id: userId,
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
});
