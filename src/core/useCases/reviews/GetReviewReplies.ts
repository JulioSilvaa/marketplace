import { ReviewReplyEntity } from "../../entities/ReviewReplyEntity";
import { IReviewReplyRepository } from "../../repositories/IReviewReplyRepository";

interface IRequest {
  reviewIds: string[];
}

export class GetReviewReplies {
  constructor(private reviewReplyRepository: IReviewReplyRepository) {}

  async execute(request: IRequest): Promise<ReviewReplyEntity[]> {
    if (!request.reviewIds || request.reviewIds.length === 0) {
      return [];
    }

    return await this.reviewReplyRepository.findByReviewIds(request.reviewIds);
  }
}
