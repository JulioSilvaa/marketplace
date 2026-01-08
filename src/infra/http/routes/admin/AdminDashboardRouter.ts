import { Router } from "express";

import AdminDashboardController from "../../controllers/admin/AdminDashboardController";
import AdminAuthMiddleware from "../../middlewares/AdminAuthMiddleware";

const router = Router();

router.use(AdminAuthMiddleware.auth);

router.get("/stats", AdminDashboardController.getStats);
router.get("/charts", AdminDashboardController.getCharts);
router.get("/lists", AdminDashboardController.getLists);

export default router;
