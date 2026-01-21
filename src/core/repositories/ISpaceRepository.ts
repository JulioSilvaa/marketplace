import { SpaceEntity } from "../entities/SpaceEntity";

export interface SpaceWithRating {
  space: SpaceEntity;
  average_rating: number | null;
  reviews_count: number;
  owner?: any;
  subscription?: {
    plan: string;
    status: string;
  };
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
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
  type?: string;
}

export interface ISpaceRepository {
  create(space: SpaceEntity): Promise<SpaceEntity>;
  findById(id: string): Promise<SpaceEntity | null>;
  findByIdWithRating(id: string): Promise<SpaceWithRating | null>;
  listByOwnerId(ownerId: string): Promise<SpaceEntity[]>;
  listByOwnerIdWithMetrics(ownerId: string): Promise<SpaceWithMetrics[]>;
  findAll(): Promise<SpaceEntity[]>;
  findAllWithRatings(filters?: SpaceFilters): Promise<SpaceWithRating[]>;
  count(filters?: SpaceFilters): Promise<number>;
  search(filters?: SpaceFilters): Promise<{ data: SpaceWithRating[]; total: number }>;
  update(space: SpaceEntity): Promise<void>;
  updateStatus(id: string, status: "active" | "inactive" | "suspended"): Promise<void>;
  delete(id: string): Promise<void>;
}
