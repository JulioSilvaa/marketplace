import { SpaceRepositoryInMemory } from "./../../../infra/repositories/inMemory/SpaceRepositoryInMemory";
import { describe, it, expect, beforeEach } from "vitest";
import { CreateSpace } from "../../../core/useCases/spaces/Create";

import { UserRole } from "../../../types/user";
import { UserRepositoryInMemory } from "../../../infra/repositories/inMemory/UserRepositoryInMemory";

describe("Create Space UseCase", () => {
  let createSpace: CreateSpace;
  let spaceRepo: SpaceRepositoryInMemory;
  let userRepo: UserRepositoryInMemory;

  beforeEach(async () => {
    spaceRepo = new SpaceRepositoryInMemory();
    userRepo = new UserRepositoryInMemory();
    createSpace = new CreateSpace(spaceRepo, userRepo);
  });

  it("should be able to create a space", async () => {
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

    // 2. Execute
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

  it("should NOT be able to create a space if owner does not exist", async () => {
    const spaceInput = {
      owner_id: "non-existent-user",
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

    await expect(createSpace.execute(spaceInput)).rejects.toThrow("Owner not found");
  });

  it("should create a space with inactive status by default", async () => {
    // 1. Create User
    const user = {
      id: "user-default-status",
      name: "Status Tester",
      email: "status@tester.com",
      phone: "123123123",
      password: "123",
      role: UserRole.PROPRIETARIO,
      checked: true,
      status: 0,
    };
    await userRepo.create(user);

    // 2. Execute
    const spaceInput = {
      owner_id: "user-default-status",
      title: "Inactive Space",
      description: "Should be inactive initially",
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
      images: ["http://example.com/image.jpg"],
    };

    const space = await createSpace.execute(spaceInput);

    expect(space.status).toBe("inactive");
  });
});
