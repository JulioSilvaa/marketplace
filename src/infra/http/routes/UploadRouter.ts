import { Router } from "express";

import { UploadController } from "../controllers/UploadController";
import authMiddleware from "../middlewares/AuthMiddleware";
import { uploadImages } from "../middlewares/uploadMiddleware";

const uploadRouter = Router();
const uploadController = new UploadController();

// POST /api/upload/images - Upload de imagens (protegido)
uploadRouter.post(
  "/images",
  authMiddleware.auth.bind(authMiddleware),
  uploadImages,
  uploadController.uploadImages.bind(uploadController)
);

// DELETE /api/upload/images/:filename - Deletar imagem (protegido)
uploadRouter.delete(
  "/images/:filename",
  authMiddleware.auth.bind(authMiddleware),
  uploadController.deleteImage.bind(uploadController)
);

export { uploadRouter };
