import { describe, it, expect, beforeEach } from "vitest";
import { CreateSubscription } from "../../../core/useCases/subscriptions/Create";
import { SubscriptionRepositoryInMemory } from "../../../infra/repositories/inMemory/SubscriptionRepositoryInMemory";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { SubscriptionStatus } from "../../../types/Subscription";
import { UserRole } from "../../../types/user";

describe("Create Subscription UseCase", () => {
  let createSub: CreateSubscription;
  let subRepo: SubscriptionRepositoryInMemory;
  let userRepo: UserRepositoryInMemory;

  beforeEach(() => {
    subRepo = new SubscriptionRepositoryInMemory();
    userRepo = new UserRepositoryInMemory();
    createSub = new CreateSubscription(subRepo, userRepo);
  });

  it("should be able to create a subscription for a user", async () => {
    const user = {
      id: "user-1",
      name: "John",
      email: "john@test.com",
      phone: "1234567890",
      password: "123",
      role: UserRole.CLIENTE,
      checked: true,
      status: 0,
    };
    await userRepo.create(user);

    const sub = await createSub.execute({
      user_id: "user-1",
      plan: "pro",
      status: SubscriptionStatus.ACTIVE,
      price: 50,
    });

    expect(sub).toBeDefined();
    expect(sub.user_id).toBe("user-1");
    expect(sub.plan).toBe("pro");
  });

  it("should fail if user does not exist", async () => {
    await expect(
      createSub.execute({
        user_id: "non-existing-user",
        plan: "basic",
        price: 30,
      })
    ).rejects.toThrow("User not found");
  });
});
