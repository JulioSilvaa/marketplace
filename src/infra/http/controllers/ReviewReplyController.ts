import { NextFunction, Request, Response } from "express";

import { ReviewReplyUseCaseFactory } from "../../factories/ReviewReplyUseCaseFactory";

export default class ReviewReplyController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const owner_user_id = req.user_id;
      if (!owner_user_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const { review_id, listing_id, reply_text } = req.body;
      const createReviewReply = ReviewReplyUseCaseFactory.makeCreateReviewReply();
      const reply = await createReviewReply.execute({
        review_id,
        listing_id,
        owner_user_id,
        reply_text,
      });

      return res.status(201).json(reply.props);
    } catch (error) {
      next(error);
    }
  }

  static async getByReviewIds(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewIds } = req.query;
      const ids = Array.isArray(reviewIds) ? (reviewIds as string[]) : [reviewIds as string];

      const getReviewReplies = ReviewReplyUseCaseFactory.makeGetReviewReplies();
      const replies = await getReviewReplies.execute({
        reviewIds: ids,
      });

      return res.status(200).json(replies.map(r => r.props));
    } catch (error) {
      next(error);
    }
  }
}
