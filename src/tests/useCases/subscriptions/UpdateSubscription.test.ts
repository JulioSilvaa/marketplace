import { beforeEach, describe, expect, it } from "vitest";

import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { UpdateSubscription } from "../../../core/useCases/subscriptions/Update";
import { SubscriptionRepositoryInMemory } from "../../../infra/repositories/inMemory/SubscriptionRepositoryInMemory";
import { SubscriptionStatus } from "../../../types/Subscription";

describe("UpdateSubscription UseCase", () => {
  let updateSubscription: UpdateSubscription;
  let subRepo: SubscriptionRepositoryInMemory;

  beforeEach(() => {
    subRepo = new SubscriptionRepositoryInMemory();
    updateSubscription = new UpdateSubscription(subRepo);
  });

  it("should update subscription plan and price", async () => {
    const subscription = SubscriptionEntity.create({
      id: "sub-1",
      user_id: "user-1",
      plan: "basic",
      price: 30,
      status: SubscriptionStatus.ACTIVE,
    });

    await subRepo.create(subscription);

    await updateSubscription.execute({
      id: "sub-1",
      plan: "premium",
      price: 50,
    });

    const updated = await subRepo.findById("sub-1");

    expect(updated).toBeDefined();
    expect(updated?.plan).toBe("premium");
    expect(updated?.price).toBe(50);
  });

  it("should activate a trial subscription", async () => {
    const subscription = SubscriptionEntity.create({
      id: "sub-1",
      user_id: "user-1",
      plan: "basic",
      price: 30,
      status: SubscriptionStatus.TRIAL,
    });

    await subRepo.create(subscription);

    await updateSubscription.execute({
      id: "sub-1",
      status: SubscriptionStatus.ACTIVE,
    });

    const updated = await subRepo.findById("sub-1");

    expect(updated).toBeDefined();
    expect(updated?.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it("should suspend an active subscription", async () => {
    const subscription = SubscriptionEntity.create({
      id: "sub-1",
      user_id: "user-1",
      plan: "basic",
      price: 30,
      status: SubscriptionStatus.ACTIVE,
    });

    await subRepo.create(subscription);

    await updateSubscription.execute({
      id: "sub-1",
      status: SubscriptionStatus.SUSPENDED,
    });

    const updated = await subRepo.findById("sub-1");

    expect(updated).toBeDefined();
    expect(updated?.status).toBe(SubscriptionStatus.SUSPENDED);
  });

  it("should update billing date", async () => {
    const subscription = SubscriptionEntity.create({
      id: "sub-1",
      user_id: "user-1",
      plan: "basic",
      price: 30,
      status: SubscriptionStatus.ACTIVE,
    });

    await subRepo.create(subscription);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await updateSubscription.execute({
      id: "sub-1",
      next_billing_date: futureDate,
    });

    const updated = await subRepo.findById("sub-1");

    expect(updated).toBeDefined();
    expect(updated?.next_billing_date).toEqual(futureDate);
  });

  it("should throw error when subscription is not found", async () => {
    await expect(
      updateSubscription.execute({
        id: "non-existent",
        plan: "premium",
      })
    ).rejects.toThrow("Subscription not found");
  });
});
