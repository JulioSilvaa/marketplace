import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import SubscriptionController from "../controllers/SubscriptionController";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const router = Router();

// Todas as rotas protegidas (requerem autenticação)
// Futuramente: apenas SUPER_ADMIN poderá acessar
router.get(
  "/",
  AuthMiddleware.auth,
  ExpressAdapter.create(SubscriptionController.getSubscriptions)
);
router.post("/", AuthMiddleware.auth, ExpressAdapter.create(SubscriptionController.add));
router.get(
  "/user/:userId",
  AuthMiddleware.auth,
  ExpressAdapter.create(SubscriptionController.findByUserId)
);
router.patch("/:id", AuthMiddleware.auth, ExpressAdapter.create(SubscriptionController.update));

export default router;
