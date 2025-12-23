import { IReviewRepository } from "../../repositories/IReviewRepository";

interface GetReviewsInput {
  spaceId: string;
  limit?: number;
  offset?: number;
}

export class GetListingReviews {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(input: GetReviewsInput) {
    const limit = input.limit || 50;
    const offset = input.offset || 0;

    const [reviews, total] = await Promise.all([
      this.reviewRepository.findBySpaceId(input.spaceId, limit, offset),
      this.reviewRepository.countBySpaceId(input.spaceId),
    ]);

    return {
      reviews,
      total,
    };
  }
}
