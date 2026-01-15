import { NextFunction, Request, Response } from "express";

import { ReviewUseCaseFactory } from "../../factories/ReviewUseCaseFactory";

export default class ReviewController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user_id; // May be undefined for anonymous users

      const { space_id, listing_id, rating, comment, reviewer_name } = req.body;
      const target_space_id = listing_id || space_id;

      // Determine reviewer name
      const finalReviewerName = reviewer_name || "Usuário Anônimo";

      const createReview = ReviewUseCaseFactory.makeCreateReview();
      const review = await createReview.execute({
        space_id: target_space_id,
        user_id,
        reviewer_name: finalReviewerName,
        rating: Number(rating),
        comment,
      });

      // Track activity event
      try {
        const { CreateBatchEvents } =
          await import("../../../core/useCases/events/CreateBatchEvents");
        const { EventRepositoryPrisma } =
          await import("../../repositories/sql/EventRepositoryPrisma");
        const eventRepo = new EventRepositoryPrisma();
        const createEvents = new CreateBatchEvents(eventRepo);

        await createEvents.execute([
          {
            listing_id: target_space_id,
            user_id: user_id || null,
            event_type: "review",
            metadata: {
              rating: Number(rating),
              reviewer_name: finalReviewerName,
              comment: comment,
            },
            created_at: new Date(),
          } as any,
        ]);
      } catch (trackError) {
        console.error("Failed to track review event:", trackError);
      }

      return res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  static async getByListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit, offset } = req.query;

      const getListingReviews = ReviewUseCaseFactory.makeGetListingReviews();
      const result = await getListingReviews.execute({
        spaceId: id,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });

      // Get user names for reviews
      const { prisma } = await import("../../../lib/prisma");
      const userIds = result.reviews
        .map((r: any) => r.props.user_id)
        .filter((id: any): id is string => Boolean(id));
      const users = await prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });

      return res.status(200).json({
        reviews: result.reviews.map((r: any) => {
          const user = users.find((u: any) => u.id === r.props.user_id);
          return {
            ...r.props,
            reviewer_name: r.props.reviewer_name || user?.name || "Usuário Anônimo",
          };
        }),
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { listing_id } = req.query;
      const user_id = req.user_id;

      if (!user_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // If listing_id is provided, get reviews for that specific listing
      if (listing_id && typeof listing_id === "string") {
        // Get reviews for that specific listing
        const { prisma } = await import("../../../lib/prisma");
        const { status } = req.query;

        const baseWhere: any = {
          space_id: listing_id,
        };

        if (status === "pending") {
          baseWhere.review_replies = { none: {} };
        } else if (status === "replied") {
          baseWhere.review_replies = { some: {} };
        }

        const reviews = await prisma.review.findMany({
          where: baseWhere,
          include: {
            spaces: {
              select: {
                id: true,
                title: true,
                city: true,
                state: true,
                owner_id: true,
              },
            },
            users: {
              select: {
                name: true,
              },
            },
            review_replies: true,
          },
          orderBy: {
            created_at: "desc",
          },
        });

        return res.status(200).json({
          reviews: reviews.map((r: any) => ({
            id: r.id,
            user_id: r.user_id,
            reviewer_name: r.users?.name || "Usuário Anônimo",
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at.toISOString(),
            reply: r.review_replies.length > 0 ? r.review_replies[0] : null,
            listings: {
              id: r.spaces.id,
              title: r.spaces.title,
              city: r.spaces.city,
              state: r.spaces.state,
              user_id: r.spaces.owner_id,
            },
          })),
          total: reviews.length,
        });
      }

      // Otherwise, get all reviews for all user's listings
      // First, get all spaces owned by the user
      const { SpaceRepositoryPrisma } =
        await import("../../repositories/sql/SpaceRepositoryPrisma");
      const spaceRepository = new SpaceRepositoryPrisma();
      const userSpaces = await spaceRepository.listByOwnerId(user_id);

      if (userSpaces.length === 0) {
        return res.status(200).json({
          reviews: [],
          total: 0,
        });
      }

      // Get reviews for all user's spaces
      const spaceIds = userSpaces
        .map((s: any) => s.id)
        .filter((id: any): id is string => id !== undefined);
      const { prisma } = await import("../../../lib/prisma");
      const { status } = req.query;

      const baseWhere: any = {
        space_id: { in: spaceIds },
      };

      if (status === "pending") {
        baseWhere.review_replies = { none: {} };
      } else if (status === "replied") {
        baseWhere.review_replies = { some: {} };
      }

      const reviews = await prisma.review.findMany({
        where: baseWhere,
        include: {
          spaces: {
            select: {
              id: true,
              title: true,
              city: true,
              state: true,
              owner_id: true,
            },
          },
          users: {
            select: {
              name: true,
            },
          },
          review_replies: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return res.status(200).json({
        reviews: reviews.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          reviewer_name: r.users?.name || "Usuário Anônimo",
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at.toISOString(),
          reply: r.review_replies.length > 0 ? r.review_replies[0] : null,
          listings: {
            id: r.spaces.id,
            title: r.spaces.title,
            city: r.spaces.city,
            state: r.spaces.state,
            user_id: r.spaces.owner_id,
          },
        })),
        total: reviews.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
