/* eslint-disable no-undef */
export interface IImageService {
  processImage(buffer: Buffer, filename: string): Promise<ProcessedImage>;
  validateImage(buffer: Buffer, mimetype: string): Promise<boolean>;
}

export interface ProcessedImage {
  thumbnail: Buffer;
  medium: Buffer;
  large: Buffer;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  originalSize: number;
  compressedSize: number;
  format: string;
  width: number;
  height: number;
}
