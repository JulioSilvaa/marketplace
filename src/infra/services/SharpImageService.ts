/* eslint-disable no-undef */
import sharp from "sharp";

import type {
  IImageService,
  ImageMetadata,
  ProcessedImage,
} from "../../core/services/IImageService";

export class SharpImageService implements IImageService {
  private readonly ALLOWED_FORMATS = ["jpeg", "png", "webp"];
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

  // Tamanhos otimizados
  private readonly SIZES = {
    thumbnail: { width: 400, height: 300 },
    medium: { width: 1280, height: 720 },
    large: { width: 1920, height: 1080 },
  };

  async validateImage(buffer: Buffer, mimetype: string): Promise<boolean> {
    // Validar tamanho
    if (buffer.length > this.MAX_SIZE) {
      throw new Error("Image size exceeds 5MB limit");
    }

    // Validar formato via mimetype
    const format = mimetype.split("/")[1];
    if (!this.ALLOWED_FORMATS.includes(format)) {
      throw new Error("Invalid format. Use JPEG, PNG or WebP");
    }

    // Validar magic numbers (segurança extra)
    try {
      const metadata = await sharp(buffer).metadata();
      if (!metadata.format || !this.ALLOWED_FORMATS.includes(metadata.format)) {
        throw new Error("Invalid image format");
      }
      return true;
    } catch (error) {
      throw new Error("Invalid image file");
    }
  }

  async processImage(buffer: Buffer, filename: string): Promise<ProcessedImage> {
    const originalMetadata = await sharp(buffer).metadata();

    // Processar uma única imagem otimizada (medium quality)
    const image = await this.resizeImage(buffer, this.SIZES.medium.width, this.SIZES.medium.height);

    const metadata: ImageMetadata = {
      originalSize: buffer.length,
      compressedSize: image.length,
      format: "webp",
      width: originalMetadata.width || 0,
      height: originalMetadata.height || 0,
    };

    return {
      image,
      metadata,
    };
  }

  private async resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .webp({
        quality: 80,
        effort: 6, // Melhor compressão (0-6)
      })
      .toBuffer();
  }
}
