import { beforeEach, describe, expect, it } from "vitest";

import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { FindAllSpaces } from "../../../core/useCases/spaces/FindAll";
import { SpaceRepositoryInMemory } from "../../../infra/repositories/inMemory/SpaceRepositoryInMemory";

describe("FindAllSpaces UseCase", () => {
  let findAllSpaces: FindAllSpaces;
  let spaceRepo: SpaceRepositoryInMemory;

  beforeEach(() => {
    spaceRepo = new SpaceRepositoryInMemory();
    findAllSpaces = new FindAllSpaces(spaceRepo);
  });

  it("should return all spaces", async () => {
    const space1 = SpaceEntity.create({
      id: "space-1",
      owner_id: "user-1",
      title: "Space 1",
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
      comfort: ["Wifi"],
      images: ["http://example.com/1.jpg"],
      status: "active",
    });

    const space2 = SpaceEntity.create({
      id: "space-2",
      owner_id: "user-2",
      title: "Space 2",
      description: "Another beautiful place for your vacation",
      address: {
        street: "Second St",
        number: "456",
        neighborhood: "Uptown",
        city: "City",
        state: "ST",
        country: "Country",
        zipcode: "98765-432",
      },
      capacity: 30,
      price_per_day: 80,
      comfort: ["Pool"],
      images: ["http://example.com/2.jpg"],
      status: "active",
    });

    await spaceRepo.create(space1);
    await spaceRepo.create(space2);

    const result = await findAllSpaces.execute();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("space-1");
    expect(result[1].id).toBe("space-2");
  });

  it("should return empty array when no spaces exist", async () => {
    const result = await findAllSpaces.execute();

    expect(result).toHaveLength(0);
  });
});
