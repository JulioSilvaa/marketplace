import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import SpaceController from "../controllers/SpaceController";

const router = Router();

// 1. Rotas de ação/busca (mais específicas)
// router.get("/search", ExpressAdapter.create(SpaceController.search));

// 2. Rotas de coleção
router.get("/", ExpressAdapter.create(SpaceController.getSpaces));
router.get("/all", ExpressAdapter.create(SpaceController.getAllSpaces));
router.post("/", ExpressAdapter.create(SpaceController.add));

// 3. Rotas com parâmetros (menos específicas)
router.get("/:id", ExpressAdapter.create(SpaceController.findById));
router.patch("/:id", ExpressAdapter.create(SpaceController.update));
router.delete("/:id", ExpressAdapter.create(SpaceController.delete));

export default router;
