import { beforeEach, describe, expect, it } from "vitest";

import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { DeleteSpace } from "../../../core/useCases/spaces/Delete";
import { SpaceRepositoryInMemory } from "../../../infra/repositories/inMemory/SpaceRepositoryInMemory";

describe("DeleteSpace UseCase", () => {
  let deleteSpace: DeleteSpace;
  let spaceRepo: SpaceRepositoryInMemory;

  beforeEach(() => {
    spaceRepo = new SpaceRepositoryInMemory();
    deleteSpace = new DeleteSpace(spaceRepo);
  });

  it("should soft delete a space by setting status to inactive", async () => {
    const space = SpaceEntity.create({
      id: "space-1",
      owner_id: "user-1",
      title: "My Space",
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
      images: ["http://example.com/image.jpg"],
      status: "active",
    });

    await spaceRepo.create(space);

    await deleteSpace.execute({
      id: "space-1",
      owner_id: "user-1",
    });

    const deleted = await spaceRepo.findById("space-1");

    expect(deleted).toBeDefined();
    expect(deleted?.status).toBe("inactive");
  });

  it("should throw error when space is not found", async () => {
    await expect(
      deleteSpace.execute({
        id: "non-existent",
        owner_id: "user-1",
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
      deleteSpace.execute({
        id: "space-1",
        owner_id: "different-user",
      })
    ).rejects.toThrow("You are not authorized to delete this space");
  });
});
