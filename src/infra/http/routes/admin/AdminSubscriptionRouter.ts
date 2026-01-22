import { Router } from "express";

import AdminSubscriptionController from "../../controllers/admin/AdminSubscriptionController";

const adminSubscriptionRouter = Router();

adminSubscriptionRouter.get("/", AdminSubscriptionController.list);
adminSubscriptionRouter.post("/:id/cancel", AdminSubscriptionController.cancel);

export default adminSubscriptionRouter;
