import { SpaceEntity } from "../entities/SpaceEntity";

export interface SpaceWithRating {
  space: SpaceEntity;
  average_rating: number | null;
  reviews_count: number;
  owner?: any;
}

export interface SpaceWithMetrics extends SpaceWithRating {
  views_count: number;
  contacts_count: number;
}

export interface SpaceFilters {
  category_id?: number;
  city?: string;
  state?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
  neighborhood?: string;
  limit?: number;
}

export interface ISpaceRepository {
  create(space: SpaceEntity): Promise<SpaceEntity>;
  findById(id: string): Promise<SpaceEntity | null>;
  findByIdWithRating(id: string): Promise<SpaceWithRating | null>;
  listByOwnerId(ownerId: string): Promise<SpaceEntity[]>;
  listByOwnerIdWithMetrics(ownerId: string): Promise<SpaceWithMetrics[]>;
  findAll(): Promise<SpaceEntity[]>;
  findAllWithRatings(filters?: SpaceFilters): Promise<SpaceWithRating[]>;
  update(space: SpaceEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
