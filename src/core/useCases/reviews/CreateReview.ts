import { ReviewEntity } from "../../entities/ReviewEntity";
import { IReviewRepository } from "../../repositories/IReviewRepository";

interface CreateReviewInput {
  space_id: string;
  user_id: string;
  rating: number;
  comment: string;
}

export class CreateReview {
  constructor(
    private reviewRepository: IReviewRepository,
    private uuidGenerator: { generate(): string }
  ) {}

  async execute(input: CreateReviewInput): Promise<ReviewEntity> {
    const id = this.uuidGenerator.generate();

    const review = ReviewEntity.create({
      id,
      ...input,
    });

    return this.reviewRepository.create(review);
  }
}
