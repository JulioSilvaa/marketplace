import { ReviewReplyEntity } from "../../entities/ReviewReplyEntity";
import { IReviewReplyRepository } from "../../repositories/IReviewReplyRepository";
import { IUuidGenerator } from "../../services/IUuidGenerator";

interface IRequest {
  review_id: string;
  listing_id: string;
  owner_user_id: string;
  reply_text: string;
}

export class CreateReviewReply {
  constructor(
    private reviewReplyRepository: IReviewReplyRepository,
    private uuidGenerator: IUuidGenerator
  ) {}

  async execute(request: IRequest): Promise<ReviewReplyEntity> {
    // Check if reply already exists for this review
    const existingReply = await this.reviewReplyRepository.findByReviewId(request.review_id);
    if (existingReply) {
      throw new Error("Já existe uma resposta para esta avaliação");
    }

    const reply = ReviewReplyEntity.create({
      id: this.uuidGenerator.generate(),
      review_id: request.review_id,
      listing_id: request.listing_id,
      owner_user_id: request.owner_user_id,
      reply_text: request.reply_text,
    });

    return await this.reviewReplyRepository.create(reply);
  }
}
