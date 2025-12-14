import { beforeEach, describe, expect, it } from "vitest";

import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { FindByIdSpace } from "../../../core/useCases/spaces/FindById";
import { SpaceRepositoryInMemory } from "../../../infra/repositories/inMemory/SpaceRepositoryInMemory";

describe("FindByIdSpace UseCase", () => {
  let findByIdSpace: FindByIdSpace;
  let spaceRepo: SpaceRepositoryInMemory;

  beforeEach(() => {
    spaceRepo = new SpaceRepositoryInMemory();
    findByIdSpace = new FindByIdSpace(spaceRepo);
  });

  it("should find a space by id", async () => {
    const space = SpaceEntity.create({
      id: "space-1",
      owner_id: "user-1",
      title: "Beautiful Space",
      description: "A very nice place to stay for your vacation",
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
      status: "active",
    });

    await spaceRepo.create(space);

    const result = await findByIdSpace.execute("space-1");

    expect(result).toBeDefined();
    expect(result?.id).toBe("space-1");
    expect(result?.title).toBe("Beautiful Space");
  });

  it("should return null when space is not found", async () => {
    const result = await findByIdSpace.execute("non-existent-id");

    expect(result).toBeNull();
  });
});
