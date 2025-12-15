/* eslint-disable no-undef */
export interface IStorageService {
  uploadImage(bucket: string, path: string, buffer: Buffer, contentType: string): Promise<string>;

  deleteImage(bucket: string, path: string): Promise<void>;

  getPublicUrl(bucket: string, path: string): string;
}
