import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import UserController from "../controllers/UserController";

const router = Router();

router.get("/search", ExpressAdapter.create(UserController.search));

router.get("/", ExpressAdapter.create(UserController.getUsers));
router.post("/", ExpressAdapter.create(UserController.add));
// router.post("/auth", ExpressAdapter.create(UserController.auth));

router.get("/:id", ExpressAdapter.create(UserController.findById));
router.patch("/:id", ExpressAdapter.create(UserController.update));
router.delete("/:id", ExpressAdapter.create(UserController.delete));

export default router;
