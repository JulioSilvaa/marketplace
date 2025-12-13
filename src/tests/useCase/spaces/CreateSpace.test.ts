import { describe, it, expect, beforeEach } from "vitest";
import { CreateSpace } from "../../../core/useCases/spaces/Create";
import { SpaceRepositoryInMemory } from "../../../infra/repositories/inMemory/SpaceRepositoryInMemory";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";
import { SubscriptionRepositoryInMemory } from "../../../infra/repositories/inMemory/SubscriptionRepositoryInMemory";
import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { SubscriptionStatus } from "../../../types/Subscription";
import { spaceStatus } from "../../../types/Space";
import { UserRole } from "../../../types/user";

describe("Create Space UseCase", () => {
  let createSpace: CreateSpace;
  let spaceRepo: SpaceRepositoryInMemory;
  let userRepo: UserRepositoryInMemory;
  let subRepo: SubscriptionRepositoryInMemory;

  beforeEach(async () => {
    spaceRepo = new SpaceRepositoryInMemory();
    userRepo = new UserRepositoryInMemory();
    subRepo = new SubscriptionRepositoryInMemory();
    createSpace = new CreateSpace(spaceRepo, userRepo, subRepo);
  });

  it("should be able to create a space when user has active subscription", async () => {
    // 1. Create User
    const user = {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "123",
      role: UserRole.PROPRIETARIO,
      checked: true,
      status: 0, // ATIVO
    };
    await userRepo.create(user);

    // 2. Create Active Subscription
    const sub = SubscriptionEntity.create({
      user_id: "user-1",
      status: SubscriptionStatus.ACTIVE,
      plan: "basic",
      price: 30,
    });
    await subRepo.create(sub);

    // 3. Execute
    const spaceInput = {
      owner_id: "user-1",
      title: "My Beautiful Space",
      description: "A very nice place to stay A very nice place to stay",
      address: {
        street: "Main St",
        number: "123",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        country: "Country",
        zipcode: "12345-678",
      },
      capacity: 50,
      price_per_day: 100,
      comfort: ["Wifi", "Pool"],
      images: ["http://example.com/image.jpg"],
    };

    const space = await createSpace.execute(spaceInput);

    expect(space).toBeDefined();
    expect(space.id).toBeDefined();
    expect(space.title).toBe("My Beautiful Space");
  });

  it("should NOT be able to create a space without active subscription", async () => {
    const user = {
      id: "user-2",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "9876543210",
      password: "123",
      role: UserRole.PROPRIETARIO,
      checked: true,
      status: 0, // ATIVO
    };
    await userRepo.create(user);

    // No subscription created for user-2

    const spaceInput = {
      owner_id: "user-2",
      title: "My Space",
      description: "Desc Desc Desc Desc Desc Desc",
      address: {
        street: "Main St",
        number: "123",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        country: "Country",
        zipcode: "12345-678",
      },
      capacity: 50,
      price_per_day: 100,
      comfort: ["Wifi"],
      images: ["http://ex.com/img.png"],
    };

    await expect(createSpace.execute(spaceInput)).rejects.toThrow(
      "User needs an active subscription"
    );
  });
});
