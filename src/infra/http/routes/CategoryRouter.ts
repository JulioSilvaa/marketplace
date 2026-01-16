import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import CategoryController from "../controllers/CategoryController";

const router = Router();

router.get("/", ExpressAdapter.create(CategoryController.index));

export default router;
