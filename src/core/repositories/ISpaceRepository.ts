import { SpaceEntity } from "../entities/SpaceEntity";

export interface SpaceWithRating {
  space: SpaceEntity;
  average_rating: number | null;
  reviews_count: number;
}

export interface ISpaceRepository {
  create(space: SpaceEntity): Promise<SpaceEntity>;
  findById(id: string): Promise<SpaceEntity | null>;
  findByIdWithRating(id: string): Promise<SpaceWithRating | null>;
  listByOwnerId(ownerId: string): Promise<SpaceEntity[]>;
  findAll(): Promise<SpaceEntity[]>;
  findAllWithRatings(): Promise<SpaceWithRating[]>;
  update(space: SpaceEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
