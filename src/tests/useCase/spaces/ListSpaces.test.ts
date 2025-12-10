import { describe, it, expect, beforeEach } from "vitest";
import { ListSpaces } from "../../../core/useCases/spaces/List";
import { SpaceRepositoryInMemory } from "../../../infra/repositories/SpaceRepositoryInMemory";
import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { spaceStatus } from "../../../types/Space";

describe("List Spaces UseCase", () => {
  let listSpaces: ListSpaces;
  let spaceRepo: SpaceRepositoryInMemory;

  beforeEach(() => {
    spaceRepo = new SpaceRepositoryInMemory();
    listSpaces = new ListSpaces(spaceRepo);
  });

  it("should be able to list spaces by owner", async () => {
    const space1 = SpaceEntity.create({
      id: "space-1",
      owner_id: "user-1",
      title: "Space 1",
      description: "Description 1 Description 1 Description 1",
      address: {
        street: "St",
        number: "1",
        neighborhood: "N",
        city: "C",
        state: "ST",
        country: "BR",
        zipcode: "12345-123",
      },
      capacity: 10,
      price_per_day: 100,
      comfort: ["Wifi"],
      images: ["http://img.com"],
      status: spaceStatus.ATIVO,
    });

    const space2 = SpaceEntity.create({
      id: "space-2",
      owner_id: "user-1",
      title: "Space 2",
      description: "Description 2 Description 2 Description 2",
      address: {
        street: "St",
        number: "2",
        neighborhood: "N",
        city: "C",
        state: "ST",
        country: "BR",
        zipcode: "12345-123",
      },
      capacity: 20,
      price_per_day: 200,
      comfort: ["Wifi"],
      images: ["http://img.com"],
      status: spaceStatus.ATIVO,
    });

    const space3 = SpaceEntity.create({
      id: "space-3",
      owner_id: "user-2", // Different owner
      title: "Space 3",
      description: "Description 3 Description 3 Description 3",
      address: {
        street: "St",
        number: "3",
        neighborhood: "N",
        city: "C",
        state: "ST",
        country: "BR",
        zipcode: "12345-123",
      },
      capacity: 30,
      price_per_day: 300,
      comfort: ["Wifi"],
      images: ["http://img.com"],
      status: spaceStatus.ATIVO,
    });

    await spaceRepo.create(space1);
    await spaceRepo.create(space2);
    await spaceRepo.create(space3);

    const user1Spaces = await listSpaces.executeByOwner({ owner_id: "user-1" });

    expect(user1Spaces).toHaveLength(2);
    expect(user1Spaces).toEqual(expect.arrayContaining([space1, space2]));
    expect(user1Spaces).not.toContain(space3);
  });

  it("should return empty array if owner has no spaces", async () => {
    const spaces = await listSpaces.executeByOwner({ owner_id: "non-existent-user" });
    expect(spaces).toEqual([]);
  });
});
