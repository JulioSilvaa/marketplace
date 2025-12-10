import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { SpaceRepositoryPrisma } from "../../../infra/repositories/SpaceRepositoryPrisma";
import { SpaceEntity } from "../../../core/entities/SpaceEntity";

import { spaceStatus } from "../../../types/Space";
import { prisma } from "../../../lib/prisma";

describe("SpaceRepositoryPrisma (Integration)", () => {
  let spaceRepository: SpaceRepositoryPrisma;

  beforeAll(() => {
    spaceRepository = new SpaceRepositoryPrisma();
  });

  beforeEach(async () => {
    // Clean up the table before each test
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Helper to create a user for FK constraint if needed
  const createTestUser = async (id: string) => {
    // Use upsert to avoid unique constraint errors if not cleaned up properly
    await prisma.users.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email: `test-${id}@example.com`,
        name: "Test Owner",
        password: "hashed-pass",
        phone: "123456789",
        role: 0,
        status: 0,
        checked: true,
      },
    });
  };

  it("should create a space in the database", async () => {
    const ownerId = "owner-123";
    await createTestUser(ownerId);

    const space = SpaceEntity.create({
      id: "space-123",
      owner_id: ownerId,
      title: "Integration Space",
      description: "A lovely place with great amenities and comfort for everyone",
      capacity: 5,
      price_per_day: 100,
      comfort: ["WiFi"],
      images: ["https://example.com/img1.jpg"],
      status: spaceStatus.ATIVO,
      address: {
        street: "Test St",
        number: "123",
        neighborhood: "Downtown",
        city: "Test City",
        state: "TS",
        zipcode: "12345-678",
        country: "Testland",
      },
    });

    await spaceRepository.create(space);

    const savedSpace = await prisma.spaces.findUnique({ where: { id: space.id } });
    expect(savedSpace).toBeDefined();
    expect(savedSpace?.title).toBe("Integration Space");
  });

  it("should find a space by id", async () => {
    const ownerId = "owner-456";
    await createTestUser(ownerId);

    const space = SpaceEntity.create({
      id: "space-456",
      owner_id: ownerId,
      title: "Find Me",
      description: "A hidden place with amazing features and comfort",
      capacity: 2,
      price_per_weekend: 200,
      comfort: ["WiFi"],
      images: ["https://example.com/img1.jpg"],
      status: spaceStatus.ATIVO,
      address: {
        street: "Find St",
        number: "456",
        neighborhood: "Uptown",
        city: "Find City",
        state: "FC",
        zipcode: "54321-000",
        country: "Findland",
      },
    });

    await spaceRepository.create(space);

    const foundSpace = await spaceRepository.findById(space.id!);
    expect(foundSpace).toBeDefined();
    expect(foundSpace?.id).toBe(space.id);
    expect(foundSpace?.title).toBe("Find Me");
  });

  it("should list spaces by owner id", async () => {
    const ownerId = "owner-789";
    await createTestUser(ownerId);

    const space1 = SpaceEntity.create({
      id: "space-789-1",
      owner_id: ownerId,
      title: "Space 1",
      description: "Description for space 1 with all amenities included",
      capacity: 10,
      price_per_day: 150,
      comfort: ["WiFi"],
      images: ["https://example.com/img1.jpg"],
      status: spaceStatus.ATIVO,
      address: {
        street: "St 1",
        number: "1",
        neighborhood: "N1",
        city: "C1",
        state: "S1",
        zipcode: "11111-111",
        country: "C1",
      },
    });

    const space2 = SpaceEntity.create({
      id: "space-789-2",
      owner_id: ownerId,
      title: "Space 2",
      description: "Description for space 2 with premium facilities",
      capacity: 20,
      price_per_day: 200,
      comfort: ["TV"],
      images: ["https://example.com/img2.jpg"],
      status: spaceStatus.ATIVO,
      address: {
        street: "St 2",
        number: "2",
        neighborhood: "N2",
        city: "C2",
        state: "S2",
        zipcode: "22222-222",
        country: "C2",
      },
    });

    await spaceRepository.create(space1);
    await spaceRepository.create(space2);

    const list = await spaceRepository.listByOwnerId(ownerId);
    expect(list).toHaveLength(2);
    // Assuming order isn't strictly guaranteed without orderBy, but we can check containment
    const titles = list.map(s => s.title);
    expect(titles).toContain("Space 1");
    expect(titles).toContain("Space 2");
  });
});
