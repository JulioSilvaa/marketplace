/* eslint-disable no-undef */
import { Request, Response } from "express";

import { SharpImageService } from "../../services/SharpImageService";
import { SupabaseStorageService } from "../../services/SupabaseStorageService";

class UploadController {
  async uploadImages(req: Request, res: Response) {
    try {
      // user_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "Nenhuma imagem enviada" });
      }

      const imageService = new SharpImageService();
      const storageService = new SupabaseStorageService();
      const BUCKET_NAME = "space-images";

      const uploadedImages = [];

      for (const file of req.files as Express.Multer.File[]) {
        // Validar e processar imagem
        await imageService.validateImage(file.buffer, file.mimetype);
        const processed = await imageService.processImage(file.buffer, file.originalname);

        // Gerar nome único
        const timestamp = Date.now();
        const baseName = file.originalname.replace(/\.[^/.]+$/, "");
        const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
        const uniqueName = `${timestamp}_${sanitizedName}`;

        // Estrutura de pastas: uploads/{owner_id}/{date}/
        const dateStr = new Date().toISOString().split("T")[0];
        const basePath = `uploads/${owner_id}/${dateStr}`;

        // Upload da imagem otimizada
        const imageUrl = await storageService.uploadImage(
          BUCKET_NAME,
          `${basePath}/${uniqueName}.webp`,
          processed.image,
          "image/webp"
        );

        // Frontend espera objeto com thumbnail, medium, large
        // Por enquanto retornamos a mesma URL para todos pois o SharpImageService só gera medium
        uploadedImages.push({
          thumbnail: imageUrl,
          medium: imageUrl,
          large: imageUrl,
          metadata: processed.metadata,
        });
      }

      return res.status(200).json({
        message: "Upload realizado com sucesso",
        images: uploadedImages,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao fazer upload de imagens" });
    }
  }
}

export default new UploadController();
