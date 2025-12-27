import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { ISpaceRepository } from "../../../core/repositories/ISpaceRepository";

export class SpaceRepositoryInMemory implements ISpaceRepository {
  public spaces: SpaceEntity[] = [];

  async create(space: SpaceEntity): Promise<SpaceEntity> {
    this.spaces.push(space);
    return space;
  }

  async findById(id: string): Promise<SpaceEntity | null> {
    const space = this.spaces.find(s => s.id === id);
    return space || null;
  }

  async listByOwnerId(ownerId: string): Promise<SpaceEntity[]> {
    return this.spaces.filter(s => s.owner_id === ownerId);
  }

  async findAll(): Promise<SpaceEntity[]> {
    return this.spaces;
  }

  async update(space: SpaceEntity): Promise<void> {
    const index = this.spaces.findIndex(s => s.id === space.id);
    if (index !== -1) {
      this.spaces[index] = space;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.spaces.findIndex(s => s.id === id);
    if (index !== -1) {
      const space = this.spaces[index];
      // Create new instance with inactive status (respecting immutability)
      const updatedSpace = SpaceEntity.create({
        id: space.id,
        owner_id: space.owner_id,
        category_id: space.category_id,
        title: space.title,
        description: space.description,
        address: space.address,
        capacity: space.capacity,
        price_per_weekend: space.price_per_weekend,
        price_per_day: space.price_per_day,
        comfort: space.comfort,
        images: space.images,
        status: "inactive",
        contact_whatsapp: space.contact_whatsapp,
        contact_phone: space.contact_phone,
        contact_email: space.contact_email,
        contact_instagram: space.contact_instagram,
        contact_facebook: space.contact_facebook,
        created_at: space.created_at,
        updated_at: space.updated_at,
      });
      this.spaces[index] = updatedSpace;
    }
  }

  async findByIdWithRating(
    id: string
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithRating | null> {
    const space = await this.findById(id);
    if (!space) return null;
    return {
      space,
      average_rating: null,
      reviews_count: 0,
    };
  }

  async listByOwnerIdWithMetrics(
    ownerId: string
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithMetrics[]> {
    const spaces = await this.listByOwnerId(ownerId);
    return spaces.map(s => ({
      space: s,
      average_rating: null,
      reviews_count: 0,
      views_count: 0,
      contacts_count: 0,
    }));
  }

  async findAllWithRatings(
    filters?: import("../../../core/repositories/ISpaceRepository").SpaceFilters
  ): Promise<import("../../../core/repositories/ISpaceRepository").SpaceWithRating[]> {
    let results = this.spaces;

    const normalize = (str: string) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (filters?.category_id) {
      results = results.filter(s => s.category_id === filters.category_id);
    }

    if (filters?.city) {
      results = results.filter(s => normalize(s.address.city) === normalize(filters.city!));
    }

    if (filters?.state) {
      results = results.filter(s => normalize(s.address.state) === normalize(filters.state!));
    }

    if (filters?.neighborhood) {
      results = results.filter(s =>
        normalize(s.address.neighborhood).includes(normalize(filters.neighborhood!))
      );
    }

    if (filters?.price_min) {
      results = results.filter(s => (s.price_per_day || 0) >= filters.price_min!);
    }

    if (filters?.price_max) {
      results = results.filter(s => (s.price_per_day || 0) <= filters.price_max!);
    }

    if (filters?.search) {
      const search = normalize(filters.search);
      results = results.filter(
        s =>
          normalize(s.title).includes(search) ||
          normalize(s.description).includes(search) ||
          normalize(s.address.neighborhood).includes(search)
      );
    }

    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }

    return results.map(s => ({
      space: s,
      average_rating: null,
      reviews_count: 0,
    }));
  }
}
