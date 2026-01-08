import { Router } from "express";

import AdminAuthController from "../../controllers/admin/AdminAuthController";
import AdminAuthMiddleware from "../../middlewares/AdminAuthMiddleware";

const router = Router();

router.post("/login", AdminAuthController.login);
router.get("/me", AdminAuthMiddleware.auth, AdminAuthController.me);

export default router;
