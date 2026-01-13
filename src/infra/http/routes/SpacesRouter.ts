import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import SpaceController from "../controllers/SpaceController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
// import { cacheMiddleware } from "../middlewares/cache.middleware"; // DESABILITADO TEMPORARIAMENTE
import { uploadImages } from "../middlewares/uploadMiddleware";

const router = Router();

// 1. Rotas de ação/busca (mais específicas)
// router.get("/search", ExpressAdapter.create(SpaceController.search));

// 2. Rotas públicas (sem autenticação) - SEM CACHE TEMPORARIAMENTE
router.get("/", ExpressAdapter.create(SpaceController.getSpaces));
router.get("/all", ExpressAdapter.create(SpaceController.getSpaces));
router.get(
  "/:id/check-ownership",
  AuthMiddleware.auth,
  ExpressAdapter.create(SpaceController.checkOwnership)
);
router.get("/:id", ExpressAdapter.create(SpaceController.findById));

// 3. Rotas protegidas (requerem autenticação)
router.post("/", AuthMiddleware.auth, uploadImages, ExpressAdapter.create(SpaceController.add));
router.patch("/:id", AuthMiddleware.auth, ExpressAdapter.create(SpaceController.update));
router.delete("/:id", AuthMiddleware.auth, ExpressAdapter.create(SpaceController.delete));

export default router;
