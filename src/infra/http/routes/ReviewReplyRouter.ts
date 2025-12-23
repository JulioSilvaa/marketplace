import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import ReviewReplyController from "../controllers/ReviewReplyController";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const router = Router();

router.post("/", AuthMiddleware.auth, ExpressAdapter.create(ReviewReplyController.create));
router.get("/", ExpressAdapter.create(ReviewReplyController.getByReviewIds));

export default router;
