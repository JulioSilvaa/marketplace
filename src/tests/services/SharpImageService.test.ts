import { describe, it, expect, beforeEach } from "vitest";
import sharp from "sharp";

import { SharpImageService } from "../../infra/services/SharpImageService";

describe("SharpImageService", () => {
  let imageService: SharpImageService;

  beforeEach(() => {
    imageService = new SharpImageService();
  });

  describe("validateImage", () => {
    it("deve validar uma imagem JPEG válida", async () => {
      // Criar uma imagem JPEG de teste
      const buffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await imageService.validateImage(buffer, "image/jpeg");
      expect(result).toBe(true);
    });

    it("deve validar uma imagem PNG válida", async () => {
      const buffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 0, g: 255, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const result = await imageService.validateImage(buffer, "image/png");
      expect(result).toBe(true);
    });

    it("deve validar uma imagem WebP válida", async () => {
      const buffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 0, g: 0, b: 255 },
        },
      })
        .webp()
        .toBuffer();

      const result = await imageService.validateImage(buffer, "image/webp");
      expect(result).toBe(true);
    });

    it("deve rejeitar formato inválido (GIF)", async () => {
      const buffer = Buffer.from("fake-gif-data");

      await expect(imageService.validateImage(buffer, "image/gif")).rejects.toThrow(
        "Invalid format"
      );
    });

    it("deve rejeitar arquivo muito grande (>5MB)", async () => {
      // Criar buffer de 6MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      await expect(imageService.validateImage(largeBuffer, "image/jpeg")).rejects.toThrow(
        "exceeds 5MB limit"
      );
    });

    it("deve rejeitar arquivo corrompido", async () => {
      const corruptedBuffer = Buffer.from("not-an-image");

      await expect(imageService.validateImage(corruptedBuffer, "image/jpeg")).rejects.toThrow(
        "Invalid image file"
      );
    });
  });

  describe("processImage", () => {
    it("deve processar imagem e gerar uma versão otimizada", async () => {
      // Criar imagem de teste 2000x1500
      const buffer = await sharp({
        create: {
          width: 2000,
          height: 1500,
          channels: 3,
          background: { r: 128, g: 128, b: 128 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await imageService.processImage(buffer, "test.jpg");

      expect(result.image).toBeInstanceOf(Buffer);
      expect(result.metadata.format).toBe("webp");
    });

    it("deve comprimir imagem (tamanho menor que original)", async () => {
      const buffer = await sharp({
        create: {
          width: 2000,
          height: 1500,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .jpeg({ quality: 100 })
        .toBuffer();

      const result = await imageService.processImage(buffer, "test.jpg");

      expect(result.metadata.compressedSize).toBeLessThan(result.metadata.originalSize);
    });

    it("deve converter para WebP", async () => {
      const buffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 100, g: 150, b: 200 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await imageService.processImage(buffer, "test.jpg");

      // Verificar que a imagem é WebP
      const imageMeta = await sharp(result.image).metadata();
      expect(imageMeta.format).toBe("webp");
    });

    it("deve gerar imagem com dimensões corretas (1024x768)", async () => {
      const buffer = await sharp({
        create: {
          width: 2000,
          height: 1500,
          channels: 3,
          background: { r: 200, g: 150, b: 100 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await imageService.processImage(buffer, "test.jpg");

      const imageMeta = await sharp(result.image).metadata();
      expect(imageMeta.width).toBe(1024);
      expect(imageMeta.height).toBe(768);
    });
  });
});
