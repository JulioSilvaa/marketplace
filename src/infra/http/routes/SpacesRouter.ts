import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import SpaceController from "../controllers/SpaceController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { cacheMiddleware } from "../middlewares/cache.middleware";
import { uploadImages } from "../middlewares/uploadMiddleware";

const router = Router();

// 1. Rotas de ação/busca (mais específicas)
// router.get("/search", ExpressAdapter.create(SpaceController.search));

// 2. Rotas públicas (sem autenticação) - com cache
router.get("/", cacheMiddleware(300), ExpressAdapter.create(SpaceController.getSpaces)); // Cache 5min
router.get("/all", cacheMiddleware(300), ExpressAdapter.create(SpaceController.getSpaces)); // Cache 5min
router.get(
  "/:id/check-ownership",
  AuthMiddleware.auth,
  ExpressAdapter.create(SpaceController.checkOwnership)
);
router.get("/:id", cacheMiddleware(600), ExpressAdapter.create(SpaceController.findById)); // Cache 10min

// 3. Rotas protegidas (requerem autenticação)
router.post("/", AuthMiddleware.auth, uploadImages, ExpressAdapter.create(SpaceController.add));
router.patch("/:id", AuthMiddleware.auth, ExpressAdapter.create(SpaceController.update));
router.delete("/:id", AuthMiddleware.auth, ExpressAdapter.create(SpaceController.delete));

export default router;
