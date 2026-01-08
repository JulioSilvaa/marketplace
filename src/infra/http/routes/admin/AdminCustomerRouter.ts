import { Router } from "express";

import AdminCustomerController from "../../controllers/admin/AdminCustomerController";
import AdminAuthMiddleware from "../../middlewares/AdminAuthMiddleware";

const router = Router();

router.use(AdminAuthMiddleware.auth);

router.get("/", AdminCustomerController.list);
router.delete("/:id", AdminCustomerController.delete);
router.patch("/:id/status", AdminCustomerController.updateStatus);

export default router;
