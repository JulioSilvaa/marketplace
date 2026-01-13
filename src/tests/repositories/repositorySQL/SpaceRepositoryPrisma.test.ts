import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { SpaceRepositoryPrisma } from "../../../infra/repositories/sql/SpaceRepositoryPrisma";
import { UserRepositoryPrisma } from "../../../infra/repositories/sql/UserRepositoryPrisma";
import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { CryptoUuidGenerator } from "../../../infra/services/CryptoUuidGenerator";
import { prisma } from "../../../lib/prisma";
import { UserIsActive, UserRole } from "../../../types/user";

describe("SpaceRepositoryPrisma (Integration)", () => {
  let spaceRepository: SpaceRepositoryPrisma;
  let userRepository: UserRepositoryPrisma;
  const uuidGenerator = new CryptoUuidGenerator();
  let testUserId: string;

  beforeAll(async () => {
    // Clean up before tests - delete in correct order for foreign keys
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});

    // Create a test user for foreign key constraints
    userRepository = new UserRepositoryPrisma();
    testUserId = uuidGenerator.generate();
    await userRepository.create({
      id: testUserId,
      name: "Test Owner",
      email: "owner@test.com",
      phone: "1234567890",
      password: "hashed_password",
      role: UserRole.PROPRIETARIO,
      checked: true,
      status: UserIsActive.ATIVO,
    });
  });

  beforeEach(async () => {
    // Clean only subscriptions and spaces between tests, keep user
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    spaceRepository = new SpaceRepositoryPrisma();
  });

  afterAll(async () => {
    await prisma.subscriptions.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.$disconnect();
  });

  it("should create a space in the database", async () => {
    const space = SpaceEntity.create({
      id: "space-123",
      owner_id: testUserId,
      title: "Integration Space",
      description: "A lovely place with great amenities and comfort for everyone",
      capacity: 5,
      price_per_day: 100,
      comfort: ["WiFi"],
      images: ["https://example.com/img1.jpg"],
      status: "active",
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
    const space = SpaceEntity.create({
      id: "space-456",
      owner_id: testUserId,
      title: "Find Me",
      description: "A hidden place with amazing features and comfort",
      capacity: 2,
      price_per_weekend: 200,
      comfort: ["WiFi"],
      images: ["https://example.com/img1.jpg"],
      status: "active",
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
    const space1 = SpaceEntity.create({
      id: "space-789-1",
      owner_id: testUserId,
      title: "Space 1",
      description: "Description for space 1 with all amenities included",
      capacity: 10,
      price_per_day: 150,
      comfort: ["WiFi"],
      images: ["https://example.com/img1.jpg"],
      status: "active",
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
      owner_id: testUserId,
      title: "Space 2",
      description: "Description for space 2 with premium facilities",
      capacity: 20,
      price_per_day: 200,
      comfort: ["TV"],
      images: ["https://example.com/img2.jpg"],
      status: "active",
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

    const list = await spaceRepository.listByOwnerId(testUserId);
    expect(list).toHaveLength(2);
    // Assuming order isn't strictly guaranteed without orderBy, but we can check containment
    const titles = list.map(s => s.title);
    expect(titles).toContain("Space 1");
    expect(titles).toContain("Space 2");
  });

  it("should find all spaces", async () => {
    const space1 = SpaceEntity.create({
      id: uuidGenerator.generate(),
      owner_id: testUserId,
      title: "Space 1 for FindAll",
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
      id: uuidGenerator.generate(),
      owner_id: testUserId,
      title: "Space 2 for FindAll",
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

    await spaceRepository.create(space1);
    await spaceRepository.create(space2);

    const allSpaces = await spaceRepository.findAll();

    expect(allSpaces.length).toBeGreaterThanOrEqual(2);
    const titles = allSpaces.map(s => s.title);
    expect(titles).toContain("Space 1 for FindAll");
    expect(titles).toContain("Space 2 for FindAll");
  });

  it("should update a space", async () => {
    const space = SpaceEntity.create({
      id: uuidGenerator.generate(),
      owner_id: testUserId,
      title: "Original Title",
      description: "Original description that will be updated",
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
      images: ["http://example.com/original.jpg"],
      status: "active",
    });

    const created = await spaceRepository.create(space);

    const updatedSpace = SpaceEntity.create({
      id: created.id!,
      owner_id: created.owner_id,
      title: "Updated Title",
      description: "Updated description with new information",
      address: created.address,
      capacity: 100,
      price_per_day: 150,
      comfort: ["Wifi", "Pool"],
      images: ["http://example.com/updated.jpg"],
      status: "active",
    });

    await spaceRepository.update(updatedSpace);

    const found = await spaceRepository.findById(created.id!);

    expect(found).toBeDefined();
    expect(found?.title).toBe("Updated Title");
    expect(found?.description).toBe("Updated description with new information");
    expect(found?.capacity).toBe(100);
    expect(found?.price_per_day).toBe(150);
  });

  it("should soft delete a space by marking status as deleted", async () => {
    const space = SpaceEntity.create({
      id: uuidGenerator.generate(),
      owner_id: testUserId,
      title: "Space to Delete",
      description: "This space will be soft deleted (marked as inactive)",
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
      images: ["http://example.com/delete.jpg"],
      status: "active",
    });

    const created = await spaceRepository.create(space);

    await spaceRepository.delete(created.id!);

    const found = await spaceRepository.findById(created.id!);
    expect(found).toBeDefined();
    expect(found?.status).toBe("deleted");
  });

  describe("findAllWithRatings (Filtering)", () => {
    it("should filter spaces by city", async () => {
      const citySpace = SpaceEntity.create({
        id: uuidGenerator.generate(),
        owner_id: testUserId,
        title: "City Space",
        description: "In target city description must be long enough for validation",
        address: {
          street: "St",
          number: "1",
          neighborhood: "Nb",
          city: "TargetCity",
          state: "TS",
          country: "C",
          zipcode: "00000-000",
        },
        capacity: 10,
        price_per_day: 100,
        comfort: ["TV"],
        images: ["http://example.com/img.jpg"],
        status: "active",
      });

      const otherSpace = SpaceEntity.create({
        id: uuidGenerator.generate(),
        owner_id: testUserId,
        title: "Other Space",
        description: "In other city description must be long enough for validation",
        address: {
          street: "St",
          number: "1",
          neighborhood: "Nb",
          city: "OtherCity",
          state: "TS",
          country: "C",
          zipcode: "00000-000",
        },
        capacity: 10,
        price_per_day: 100,
        comfort: ["TV"],
        images: ["http://example.com/img.jpg"],
        status: "active",
      });

      await spaceRepository.create(citySpace);
      await spaceRepository.create(otherSpace);

      const results = await spaceRepository.findAllWithRatings({ city: "TargetCity" });

      expect(results.length).toBe(1);
      expect(results[0].space.title).toBe("City Space");
    });
  });
});
