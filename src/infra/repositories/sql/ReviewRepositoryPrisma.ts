import { ReviewEntity } from "../../../core/entities/ReviewEntity";
import { IReviewRepository } from "../../../core/repositories/IReviewRepository";
import { prisma } from "../../../lib/prisma";

export class ReviewRepositoryPrisma implements IReviewRepository {
  async create(review: ReviewEntity): Promise<ReviewEntity> {
    const data = await (prisma as any).review.create({
      data: {
        id: review.id!,
        spaces: { connect: { id: review.space_id } },
        ...(review.user_id && { users: { connect: { id: review.user_id } } }),
        reviewer_name: review.props.reviewer_name,
        rating: review.rating,
        comment: review.comment,
      },
    });

    return ReviewEntity.create({
      id: data.id,
      space_id: data.space_id,
      user_id: data.user_id,
      reviewer_name: data.reviewer_name,
      rating: data.rating,
      comment: data.comment ?? undefined,
      created_at: data.created_at,
    });
  }

  async findBySpaceId(spaceId: string, limit: number, offset: number): Promise<ReviewEntity[]> {
    const reviewsData = await (prisma as any).review.findMany({
      where: { space_id: spaceId },
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });

    return reviewsData.map((data: any) =>
      ReviewEntity.create({
        id: data.id,
        space_id: data.space_id,
        user_id: data.user_id,
        reviewer_name: data.reviewer_name,
        rating: data.rating,
        comment: data.comment ?? undefined,
        created_at: data.created_at,
      })
    );
  }

  async countBySpaceId(spaceId: string): Promise<number> {
    return (prisma as any).review.count({
      where: { space_id: spaceId },
    });
  }
}
