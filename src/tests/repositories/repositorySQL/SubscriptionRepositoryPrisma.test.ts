import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { SubscriptionRepositoryPrisma } from "../../../infra/repositories/SubscriptionRepositoryPrisma";
import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { prisma } from "../../../infra/db/prisma/client";
import { SubscriptionStatus } from "../../../types/Subscription";

describe("SubscriptionRepositoryPrisma (Integration)", () => {
  let subRepository: SubscriptionRepositoryPrisma;

  beforeAll(() => {
    subRepository = new SubscriptionRepositoryPrisma();
  });

  beforeEach(async () => {
    await prisma.subscription.deleteMany({});
    await prisma.space.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const createTestUser = async (id: string) => {
    await prisma.user.create({
      data: {
        id,
        email: `sub-${id}@test.com`,
        name: "Sub User",
        password: "pass",
        phone: "123",
        role: 0,
        status: 0,
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

    const savedSub = await prisma.subscription.findUnique({ where: { id: sub.id } });
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

    const updatedSub = await prisma.subscription.findUnique({ where: { id: sub.id } });
    expect(updatedSub?.plan).toBe("Premium");
    expect(updatedSub?.price).toBe(100.0);
  });
});
