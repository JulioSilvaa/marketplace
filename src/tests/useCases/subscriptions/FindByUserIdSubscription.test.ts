import { beforeEach, describe, expect, it } from "vitest";

import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { FindByUserIdSubscription } from "../../../core/useCases/subscriptions/FindByUserId";
import { SubscriptionRepositoryInMemory } from "../../../infra/repositories/inMemory/SubscriptionRepositoryInMemory";
import { SubscriptionStatus } from "../../../types/Subscription";

describe("FindByUserIdSubscription UseCase", () => {
  let findByUserId: FindByUserIdSubscription;
  let subRepo: SubscriptionRepositoryInMemory;

  beforeEach(() => {
    subRepo = new SubscriptionRepositoryInMemory();
    findByUserId = new FindByUserIdSubscription(subRepo);
  });

  it("should find a subscription by user id", async () => {
    const subscription = SubscriptionEntity.create({
      id: "sub-1",
      user_id: "user-1",
      plan: "premium",
      price: 50,
      status: SubscriptionStatus.ACTIVE,
    });

    await subRepo.create(subscription);

    const result = await findByUserId.execute("user-1");

    expect(result).toBeDefined();
    expect(result?.user_id).toBe("user-1");
    expect(result?.plan).toBe("premium");
  });

  it("should return null when subscription is not found", async () => {
    const result = await findByUserId.execute("non-existent-user");

    expect(result).toBeNull();
  });
});
