import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import SubscriptionController from "../controllers/SubscriptionController";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const router = Router();

// Todas as rotas (algumas podem ser públicas)
router.get("/current-pricing", ExpressAdapter.create(SubscriptionController.getCurrentPricing));

router.get(
  "/",
  AuthMiddleware.auth,
  ExpressAdapter.create(SubscriptionController.getSubscriptions)
);
router.post(
  "/checkout",
  AuthMiddleware.auth,
  ExpressAdapter.create(SubscriptionController.checkout)
);
router.post("/", AuthMiddleware.auth, ExpressAdapter.create(SubscriptionController.add));
router.get(
  "/user/:userId",
  AuthMiddleware.auth,
  ExpressAdapter.create(SubscriptionController.findByUserId)
);
router.get(
  "/user/:userId/all",
  AuthMiddleware.auth,
  ExpressAdapter.create(SubscriptionController.findAllByUserId)
);
router.patch("/:id", AuthMiddleware.auth, ExpressAdapter.create(SubscriptionController.update));

export default router;
