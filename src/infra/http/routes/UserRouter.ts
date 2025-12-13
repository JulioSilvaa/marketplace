import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import UserController from "../controllers/UserController";

const router = Router();

// 1. Rotas de ação/busca (mais específicas)
router.get("/search", ExpressAdapter.create(UserController.search));

// 2. Rotas de coleção
router.get("/", ExpressAdapter.create(UserController.getUsers));
router.post("/", ExpressAdapter.create(UserController.add));

// 3. Rotas com parâmetros (menos específicas)
router.get("/:id", ExpressAdapter.create(UserController.findById));
router.patch("/:id", ExpressAdapter.create(UserController.update));
router.delete("/:id", ExpressAdapter.create(UserController.delete));

export default router;
