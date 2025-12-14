import { beforeEach, describe, expect, it } from "vitest";

import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { FindAllSubscriptions } from "../../../core/useCases/subscriptions/FindAll";
import { SubscriptionRepositoryInMemory } from "../../../infra/repositories/inMemory/SubscriptionRepositoryInMemory";
import { SubscriptionStatus } from "../../../types/Subscription";

describe("FindAllSubscriptions UseCase", () => {
  let findAllSubscriptions: FindAllSubscriptions;
  let subRepo: SubscriptionRepositoryInMemory;

  beforeEach(() => {
    subRepo = new SubscriptionRepositoryInMemory();
    findAllSubscriptions = new FindAllSubscriptions(subRepo);
  });

  it("should return all subscriptions", async () => {
    const sub1 = SubscriptionEntity.create({
      id: "sub-1",
      user_id: "user-1",
      plan: "basic",
      price: 30,
      status: SubscriptionStatus.ACTIVE,
    });

    const sub2 = SubscriptionEntity.create({
      id: "sub-2",
      user_id: "user-2",
      plan: "premium",
      price: 50,
      status: SubscriptionStatus.TRIAL,
    });

    await subRepo.create(sub1);
    await subRepo.create(sub2);

    const result = await findAllSubscriptions.execute();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("sub-1");
    expect(result[1].id).toBe("sub-2");
  });

  it("should return empty array when no subscriptions exist", async () => {
    const result = await findAllSubscriptions.execute();

    expect(result).toHaveLength(0);
  });
});
