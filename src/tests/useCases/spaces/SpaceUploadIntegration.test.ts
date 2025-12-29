import { describe, it, expect, beforeEach } from "vitest";
import sharp from "sharp";

import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { SharpImageService } from "../../../infra/services/SharpImageService";
import { MockStorageService } from "../../mocks/MockStorageService";

describe("Space Upload Integration", () => {
  let imageService: SharpImageService;
  let storageService: MockStorageService;
  const BUCKET_NAME = "space-images";

  beforeEach(() => {
    imageService = new SharpImageService();
    storageService = new MockStorageService();
    storageService.clear();
  });

  // Helper: criar imagem de teste
  async function createTestImage(width: number, height: number): Promise<Buffer> {
    return sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 100, g: 150, b: 200 },
      },
    })
      .jpeg()
      .toBuffer();
  }

  describe("Upload de imagens", () => {
    it("deve processar e fazer upload de 1 imagem otimizada", async () => {
      const imageBuffer = await createTestImage(2000, 1500);
      const spaceTitle = "test_space";

      // Processar imagem
      const processed = await imageService.processImage(imageBuffer, "test.jpg");

      // Upload da imagem
      const basePath = `spaces/${spaceTitle}`;
      const timestamp = Date.now();

      await storageService.uploadImage(
        BUCKET_NAME,
        `${basePath}/${timestamp}_test.webp`,
        processed.image,
        "image/webp"
      );

      // Verificar que 1 arquivo foi salvo
      expect(storageService.getUploadCount()).toBe(1);

      // Verificar estrutura de pastas
      const uploadedFiles = storageService.getUploadedFiles();
      expect(uploadedFiles.every(f => f.includes(`spaces/${spaceTitle}`))).toBe(true);
    });

    it("deve processar múltiplas imagens (3 imagens = 3 uploads)", async () => {
      const images = await Promise.all([
        createTestImage(1920, 1080),
        createTestImage(1600, 900),
        createTestImage(2400, 1800),
      ]);

      const spaceTitle = "multi_image_space";
      const basePath = `spaces/${spaceTitle}`;

      for (let i = 0; i < images.length; i++) {
        const processed = await imageService.processImage(images[i], `image${i}.jpg`);
        const timestamp = Date.now() + i;

        await storageService.uploadImage(
          BUCKET_NAME,
          `${basePath}/${timestamp}_image${i}.webp`,
          processed.image,
          "image/webp"
        );
      }

      // 3 imagens × 1 versão = 3 uploads
      expect(storageService.getUploadCount()).toBe(3);
    });

    it("deve validar que todos os uploads são WebP", async () => {
      const imageBuffer = await createTestImage(800, 600);
      const processed = await imageService.processImage(imageBuffer, "test.jpg");

      await storageService.uploadImage(
        BUCKET_NAME,
        "test/image.webp",
        processed.image,
        "image/webp"
      );

      const uploaded = storageService.getUploadedFile(BUCKET_NAME, "test/image.webp");
      expect(uploaded?.contentType).toBe("image/webp");

      // Verificar que o buffer é realmente WebP
      const metadata = await sharp(uploaded!.buffer).metadata();
      expect(metadata.format).toBe("webp");
    });
  });

  describe("Validações de limites", () => {
    it("deve rejeitar imagem maior que 5MB", async () => {
      // Criar buffer de 6MB (simulado)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      await expect(imageService.validateImage(largeBuffer, "image/jpeg")).rejects.toThrow(
        "exceeds 5MB limit"
      );
    });

    it("deve rejeitar formato inválido (GIF)", async () => {
      const buffer = Buffer.from("fake-gif-data");

      await expect(imageService.validateImage(buffer, "image/gif")).rejects.toThrow(
        "Invalid format"
      );
    });

    it("deve validar que SpaceEntity rejeita mais de 10 imagens", () => {
      const images = Array(11).fill("https://example.com/image.jpg");

      expect(() => {
        new SpaceEntity({
          owner_id: "user-123",
          title: "Test Space",
          description: "Test description with enough characters to pass validation",
          address: {
            street: "Test St",
            number: "123",
            neighborhood: "Test",
            city: "Test City",
            state: "SP",
            zipcode: "12345-678",
            country: "Brasil",
          },
          capacity: 50,
          price_per_day: 100,
          comfort: ["Pool"],
          images,
          status: "active",
        });
      }).toThrow("Máximo de 10 imagens por espaço");
    });
  });

  describe("Estrutura de dados", () => {
    it("deve aceitar URL simples de imagem no SpaceEntity", () => {
      const imageUrl = "https://example.com/image.webp";

      const space = new SpaceEntity({
        owner_id: "user-123",
        title: "Test Space",
        description: "Test description with enough characters to pass validation",
        address: {
          street: "Test St",
          number: "123",
          neighborhood: "Test",
          city: "Test City",
          state: "SP",
          zipcode: "12345-678",
          country: "Brasil",
        },
        capacity: 50,
        price_per_day: 100,
        comfort: ["Pool"],
        images: [imageUrl],
        status: "active",
      });

      expect(space.images).toHaveLength(1);
      expect(space.images[0]).toBe(imageUrl);
    });

    it("deve rejeitar URL inválida", () => {
      const invalidImageUrl = "not-a-url";

      expect(() => {
        new SpaceEntity({
          owner_id: "user-123",
          title: "Test Space",
          description: "Test description with enough characters to pass validation",
          address: {
            street: "Test St",
            number: "123",
            neighborhood: "Test",
            city: "Test City",
            state: "SP",
            zipcode: "12345-678",
            country: "Brasil",
          },
          capacity: 50,
          price_per_day: 100,
          comfort: ["Pool"],
          images: [invalidImageUrl],
          status: "active",
        });
      }).toThrow("Pelo menos um link de imagem fornecido não é um URL válido");
    });
  });
});
