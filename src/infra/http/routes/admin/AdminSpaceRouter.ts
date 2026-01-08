import { Router } from "express";

import AdminSpaceController from "../../controllers/admin/AdminSpaceController";
import AdminAuthMiddleware from "../../middlewares/AdminAuthMiddleware";

const router = Router();

router.use(AdminAuthMiddleware.auth);

router.get("/", AdminSpaceController.list);
router.patch("/:id/status", AdminSpaceController.updateStatus);

export default router;
