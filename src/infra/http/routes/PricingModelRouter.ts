import { Router } from "express";

import PricingModelController from "../controllers/PricingModelController";

const pricingModelRouter = Router();

pricingModelRouter.get("/", PricingModelController.index);

export { pricingModelRouter };
