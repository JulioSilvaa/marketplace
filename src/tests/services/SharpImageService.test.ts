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
    it("deve processar imagem e gerar 3 tamanhos", async () => {
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

      expect(result.thumbnail).toBeInstanceOf(Buffer);
      expect(result.medium).toBeInstanceOf(Buffer);
      expect(result.large).toBeInstanceOf(Buffer);
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

      // Verificar que os buffers são WebP
      const thumbMeta = await sharp(result.thumbnail).metadata();
      const mediumMeta = await sharp(result.medium).metadata();
      const largeMeta = await sharp(result.large).metadata();

      expect(thumbMeta.format).toBe("webp");
      expect(mediumMeta.format).toBe("webp");
      expect(largeMeta.format).toBe("webp");
    });

    it("deve gerar thumbnail com dimensões corretas (400x300)", async () => {
      const buffer = await sharp({
        create: {
          width: 2000,
          height: 1500,
          channels: 3,
          background: { r: 50, g: 100, b: 150 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await imageService.processImage(buffer, "test.jpg");

      const thumbMeta = await sharp(result.thumbnail).metadata();
      expect(thumbMeta.width).toBe(400);
      expect(thumbMeta.height).toBe(300);
    });

    it("deve gerar medium com dimensões corretas (1280x720)", async () => {
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

      const mediumMeta = await sharp(result.medium).metadata();
      expect(mediumMeta.width).toBe(1280);
      expect(mediumMeta.height).toBe(720);
    });

    it("deve gerar large com dimensões corretas (1920x1080)", async () => {
      const buffer = await sharp({
        create: {
          width: 3000,
          height: 2000,
          channels: 3,
          background: { r: 75, g: 125, b: 175 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await imageService.processImage(buffer, "test.jpg");

      const largeMeta = await sharp(result.large).metadata();
      expect(largeMeta.width).toBe(1920);
      expect(largeMeta.height).toBe(1080);
    });
  });
});
