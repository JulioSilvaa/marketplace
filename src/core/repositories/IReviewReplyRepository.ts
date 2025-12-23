import { ReviewReplyEntity } from "../entities/ReviewReplyEntity";

export interface IReviewReplyRepository {
  create(reply: ReviewReplyEntity): Promise<ReviewReplyEntity>;
  findByReviewId(reviewId: string): Promise<ReviewReplyEntity | null>;
  findByReviewIds(reviewIds: string[]): Promise<ReviewReplyEntity[]>;
  update(id: string, replyText: string): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ReviewReplyEntity | null>;
}
