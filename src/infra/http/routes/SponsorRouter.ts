import { Router } from "express";

import SponsorController from "../controllers/SponsorController";

const router = Router();

router.get("/", SponsorController.getActive);
router.post("/checkout", SponsorController.checkout);

export default router;
