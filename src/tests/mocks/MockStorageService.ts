import type { IStorageService } from "../../core/services/IStorageService";

export class MockStorageService implements IStorageService {
  private uploads: Map<string, { buffer: Buffer; contentType: string }> = new Map();
  private baseUrl = "https://mock.storage.supabase.co";

  async uploadImage(
    bucket: string,
    path: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    this.uploads.set(`${bucket}/${path}`, { buffer, contentType });
    return this.getPublicUrl(bucket, path);
  }

  async deleteImage(bucket: string, path: string): Promise<void> {
    this.uploads.delete(`${bucket}/${path}`);
  }

  getPublicUrl(bucket: string, path: string): string {
    return `${this.baseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }

  // Métodos auxiliares para testes
  getUploadedFiles(): string[] {
    return Array.from(this.uploads.keys());
  }

  getUploadedFile(
    bucket: string,
    path: string
  ): { buffer: Buffer; contentType: string } | undefined {
    return this.uploads.get(`${bucket}/${path}`);
  }

  clear(): void {
    this.uploads.clear();
  }

  getUploadCount(): number {
    return this.uploads.size;
  }
}
