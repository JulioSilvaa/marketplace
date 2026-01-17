import { Router } from "express";

import ExpressAdapter from "../../adapters/ExpressAdapter";
import UploadController from "../controllers/UploadController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { uploadImages } from "../middlewares/uploadMiddleware";

const router = Router();

// Rota protegida para upload de imagens
router.post(
  "/images",
  AuthMiddleware.auth,
  uploadImages,
  ExpressAdapter.create(UploadController.uploadImages)
);

export default router;
