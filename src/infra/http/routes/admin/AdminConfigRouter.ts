import { Router } from "express";

import AdminConfigController from "../../controllers/admin/AdminConfigController";
import AdminAuthMiddleware from "../../middlewares/AdminAuthMiddleware";

const adminConfigRouter = Router();
adminConfigRouter.use(AdminAuthMiddleware.auth);

// Categories
adminConfigRouter.get("/categories", AdminConfigController.listCategories);
adminConfigRouter.post("/categories", AdminConfigController.createCategory);
adminConfigRouter.put("/categories/:id", AdminConfigController.updateCategory);
adminConfigRouter.delete("/categories/:id", AdminConfigController.deleteCategory);

// Pricing Models
adminConfigRouter.get("/pricing-models", AdminConfigController.listPricingModels);
adminConfigRouter.post("/pricing-models", AdminConfigController.createPricingModel);
adminConfigRouter.put("/pricing-models/:id", AdminConfigController.updatePricingModel);
adminConfigRouter.delete("/pricing-models/:id", AdminConfigController.deletePricingModel);

export default adminConfigRouter;
