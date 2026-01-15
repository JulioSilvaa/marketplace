import { ReviewReplyEntity } from "../../../core/entities/ReviewReplyEntity";
import { IReviewReplyRepository } from "../../../core/repositories/IReviewReplyRepository";
import { prisma } from "../../../lib/prisma";

export class ReviewReplyRepositoryPrisma implements IReviewReplyRepository {
  async create(reply: ReviewReplyEntity): Promise<ReviewReplyEntity> {
    const data = await prisma.review_replies.create({
      data: {
        id: reply.id!,
        review_id: reply.review_id,
        listing_id: reply.listing_id,
        owner_user_id: reply.owner_user_id,
        reply_text: reply.reply_text,
      },
    });

    return ReviewReplyEntity.create({
      ...data,
    });
  }

  async findByReviewId(reviewId: string): Promise<ReviewReplyEntity | null> {
    const data = await prisma.review_replies.findFirst({
      where: { review_id: reviewId },
    });

    if (!data) return null;

    return ReviewReplyEntity.create({
      ...data,
    });
  }

  async findByReviewIds(reviewIds: string[]): Promise<ReviewReplyEntity[]> {
    const data = await prisma.review_replies.findMany({
      where: { review_id: { in: reviewIds } },
    });

    return data.map((item: any) => ReviewReplyEntity.create({ ...item }));
  }

  async update(id: string, replyText: string): Promise<void> {
    await prisma.review_replies.update({
      where: { id },
      data: { reply_text: replyText },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.review_replies.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<ReviewReplyEntity | null> {
    const data = await prisma.review_replies.findUnique({
      where: { id },
    });

    if (!data) return null;

    return ReviewReplyEntity.create({ ...data });
  }
}
