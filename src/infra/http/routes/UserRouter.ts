import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import UserController from "../controllers/UserController";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const router = Router();

// Rotas públicas (não requerem autenticação)
router.get("/search", ExpressAdapter.create(UserController.search));
router.get("/", ExpressAdapter.create(UserController.getUsers));
router.get("/:id", ExpressAdapter.create(UserController.findById));

// Rotas protegidas (requerem autenticação)
// Nota: Criação de usuário é feita via /auth/register
router.patch("/:id", AuthMiddleware.auth, ExpressAdapter.create(UserController.update));
router.delete("/:id", AuthMiddleware.auth, ExpressAdapter.create(UserController.delete));

export default router;
