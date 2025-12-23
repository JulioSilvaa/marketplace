import { CreateReview } from "../../core/useCases/reviews/CreateReview";
import { GetListingReviews } from "../../core/useCases/reviews/GetListingReviews";
import { ReviewRepositoryPrisma } from "../repositories/sql/ReviewRepositoryPrisma";
import { CryptoUuidGenerator } from "../services/CryptoUuidGenerator";

export class ReviewUseCaseFactory {
  static makeCreateReview(): CreateReview {
    const reviewRepository = new ReviewRepositoryPrisma();
    const uuidGenerator = new CryptoUuidGenerator();
    return new CreateReview(reviewRepository, uuidGenerator);
  }

  static makeGetListingReviews(): GetListingReviews {
    const reviewRepository = new ReviewRepositoryPrisma();
    return new GetListingReviews(reviewRepository);
  }
}
