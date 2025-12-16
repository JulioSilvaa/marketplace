/* eslint-disable no-undef */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { IStorageService } from "../../core/services/IStorageService";

export class SupabaseStorageService implements IStorageService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined in environment variables"
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  async uploadImage(
    bucket: string,
    path: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const { error } = await this.supabase.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: false,
      cacheControl: "31536000", // 1 ano de cache
    });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    return this.getPublicUrl(bucket, path);
  }

  async deleteImage(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  }
}
