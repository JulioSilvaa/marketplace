import { CreateReviewReply } from "../../core/useCases/reviews/CreateReviewReply";
import { GetReviewReplies } from "../../core/useCases/reviews/GetReviewReplies";
import { ReviewReplyRepositoryPrisma } from "../repositories/sql/ReviewReplyRepositoryPrisma";
import { CryptoUuidGenerator } from "../services/CryptoUuidGenerator";

export class ReviewReplyUseCaseFactory {
  static makeCreateReviewReply(): CreateReviewReply {
    const repository = new ReviewReplyRepositoryPrisma();
    const uuidGenerator = new CryptoUuidGenerator();
    return new CreateReviewReply(repository, uuidGenerator);
  }

  static makeGetReviewReplies(): GetReviewReplies {
    const repository = new ReviewReplyRepositoryPrisma();
    return new GetReviewReplies(repository);
  }
}
