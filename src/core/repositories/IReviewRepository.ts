import { ReviewEntity } from "../entities/ReviewEntity";

export interface IReviewRepository {
  create(review: ReviewEntity): Promise<ReviewEntity>;
  findBySpaceId(spaceId: string, limit: number, offset: number): Promise<ReviewEntity[]>;
  countBySpaceId(spaceId: string): Promise<number>;
}
