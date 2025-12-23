import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import AuthController from "../controllers/AuthController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import {
  forgotPasswordLimiter,
  loginLimiter,
  refreshLimiter,
  registerLimiter,
  resetPasswordLimiter,
} from "../middlewares/RateLimitMiddleware";

const router = Router();

// Rotas públicas de autenticação (não requerem token)
router.post("/login", loginLimiter, ExpressAdapter.create(AuthController.login));
router.post("/register", registerLimiter, ExpressAdapter.create(AuthController.register));
router.post("/refresh", refreshLimiter, ExpressAdapter.create(AuthController.refresh));
router.post("/logout", ExpressAdapter.create(AuthController.logout));
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  ExpressAdapter.create(AuthController.forgotPassword)
);
router.post(
  "/reset-password",
  resetPasswordLimiter,
  ExpressAdapter.create(AuthController.resetPassword)
);

// Rotas autenticadas
router.post(
  "/change-password",
  AuthMiddleware.auth,
  ExpressAdapter.create(AuthController.changePassword)
);

export default router;
