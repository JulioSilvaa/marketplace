import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import SubscriptionController from "../controllers/SubscriptionController";

const router = Router();

// Collection routes
router.get("/", ExpressAdapter.create(SubscriptionController.getSubscriptions));
router.post("/", ExpressAdapter.create(SubscriptionController.add));

// Routes with parameters
router.get("/user/:userId", ExpressAdapter.create(SubscriptionController.findByUserId));
router.patch("/:id", ExpressAdapter.create(SubscriptionController.update));

export default router;
