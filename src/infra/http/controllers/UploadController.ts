/* eslint-disable no-undef */
import type { Request, Response } from "express";

import { SharpImageService } from "../../services/SharpImageService";
import { SupabaseStorageService } from "../../services/SupabaseStorageService";

export class UploadController {
  private imageService = new SharpImageService();
  private storageService = new SupabaseStorageService();
  private readonly BUCKET_NAME = "space-images";

  async uploadImages(req: Request, res: Response): Promise<Response> {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          error: "Nenhuma imagem foi enviada",
        });
      }

      // Opcional: ID do espaço para organizar as imagens
      const spaceId = req.body.spaceId || "general";

      const uploadedImages = [];

      for (const file of files) {
        // 1. Validar imagem
        await this.imageService.validateImage(file.buffer, file.mimetype);

        // 2. Processar imagem (gerar 3 tamanhos)
        const processed = await this.imageService.processImage(file.buffer, file.originalname);

        // 3. Gerar nomes únicos para os arquivos
        const timestamp = Date.now();
        const baseName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extensão
        const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");

        const thumbnailPath = `spaces/${spaceId}/thumb_${timestamp}_${sanitizedName}.webp`;
        const mediumPath = `spaces/${spaceId}/medium_${timestamp}_${sanitizedName}.webp`;
        const largePath = `spaces/${spaceId}/large_${timestamp}_${sanitizedName}.webp`;

        // 4. Upload para Supabase Storage
        const [thumbnailUrl, mediumUrl, largeUrl] = await Promise.all([
          this.storageService.uploadImage(
            this.BUCKET_NAME,
            thumbnailPath,
            processed.thumbnail,
            "image/webp"
          ),
          this.storageService.uploadImage(
            this.BUCKET_NAME,
            mediumPath,
            processed.medium,
            "image/webp"
          ),
          this.storageService.uploadImage(
            this.BUCKET_NAME,
            largePath,
            processed.large,
            "image/webp"
          ),
        ]);

        uploadedImages.push({
          thumbnail: thumbnailUrl,
          medium: mediumUrl,
          large: largeUrl,
          metadata: processed.metadata,
        });
      }

      return res.status(201).json({
        message: `${uploadedImages.length} imagem(ns) enviada(s) com sucesso`,
        images: uploadedImages,
      });
    } catch (error: unknown) {
      console.error("Upload error:", error);

      if (error instanceof Error) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro ao fazer upload das imagens",
      });
    }
  }

  async deleteImage(req: Request, res: Response): Promise<Response> {
    try {
      const { filename } = req.params;

      if (!filename) {
        return res.status(400).json({
          error: "Nome do arquivo não fornecido",
        });
      }

      // Deletar os 3 tamanhos
      const spaceId = req.body.spaceId || "general";
      const basePath = `spaces/${spaceId}/${filename}`;

      await Promise.all([
        this.storageService.deleteImage(this.BUCKET_NAME, `thumb_${basePath}`),
        this.storageService.deleteImage(this.BUCKET_NAME, `medium_${basePath}`),
        this.storageService.deleteImage(this.BUCKET_NAME, `large_${basePath}`),
      ]);

      return res.status(200).json({
        message: "Imagem deletada com sucesso",
      });
    } catch (error: unknown) {
      console.error("Delete error:", error);

      if (error instanceof Error) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro ao deletar imagem",
      });
    }
  }
}
