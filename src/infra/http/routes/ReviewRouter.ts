import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import ReviewController from "../controllers/ReviewController";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const router = Router();

router.get("/listing/:id", ExpressAdapter.create(ReviewController.getByListing));
router.get(
  "/dashboard",
  AuthMiddleware.auth,
  ExpressAdapter.create(ReviewController.getDashboardReviews)
);
router.post("/", ExpressAdapter.create(ReviewController.create));

export default router;
