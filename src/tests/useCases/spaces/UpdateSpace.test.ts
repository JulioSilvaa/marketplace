import { beforeEach, describe, expect, it } from "vitest";

import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { UpdateSpace } from "../../../core/useCases/spaces/Update";
import { SpaceRepositoryInMemory } from "../../../infra/repositories/inMemory/SpaceRepositoryInMemory";

describe("UpdateSpace UseCase", () => {
  let updateSpace: UpdateSpace;
  let spaceRepo: SpaceRepositoryInMemory;

  beforeEach(() => {
    spaceRepo = new SpaceRepositoryInMemory();
    updateSpace = new UpdateSpace(spaceRepo);
  });

  it("should update a space successfully", async () => {
    const space = SpaceEntity.create({
      id: "space-1",
      owner_id: "user-1",
      title: "Old Title",
      description: "Old description that needs to be updated",
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
      images: ["http://example.com/old.jpg"],
      status: "active",
    });

    await spaceRepo.create(space);

    await updateSpace.execute({
      id: "space-1",
      owner_id: "user-1",
      title: "New Title",
      description: "New description with updated information",
      capacity: 100,
    });

    const updated = await spaceRepo.findById("space-1");

    expect(updated).toBeDefined();
    expect(updated?.title).toBe("New Title");
    expect(updated?.description).toBe("New description with updated information");
    expect(updated?.capacity).toBe(100);
  });

  it("should throw error when space is not found", async () => {
    await expect(
      updateSpace.execute({
        id: "non-existent",
        owner_id: "user-1",
        title: "New Title",
      })
    ).rejects.toThrow("Space not found");
  });

  it("should throw error when user is not the owner", async () => {
    const space = SpaceEntity.create({
      id: "space-1",
      owner_id: "user-1",
      title: "My Space",
      description: "A very nice place to stay for vacation",
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
      status: "active",
    });

    await spaceRepo.create(space);

    await expect(
      updateSpace.execute({
        id: "space-1",
        owner_id: "different-user",
        title: "Hacked Title",
      })
    ).rejects.toThrow("You are not authorized to update this space");
  });
});
