import Redis from "ioredis";

class RedisService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: times => {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts
          }
          return Math.min(times * 50, 2000);
        },
        enableOfflineQueue: false, // Fail fast if offline
      });

      this.client.on("connect", () => {
        this.isConnected = true;
      });

      this.client.on("error", err => {
        // Only log connection errors if we were previously connected or it's the first attempt
        // to avoid spamming logs
        if (this.isConnected) {
          console.error("Redis connection error", err.message);
        }
        this.isConnected = false;
      });
    } catch (error) {
      console.warn("Failed to initialize Redis client", error);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.set(key, value, "EX", ttlSeconds);
    } catch (error) {
      // Ignore cache set errors
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      // Ignore cache delete errors
    }
  }

  // Helper to get formatted cache key
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (acc, key) => {
          if (params[key] !== undefined && params[key] !== null) {
            acc[key] = params[key];
          }
          return acc;
        },
        {} as Record<string, any>
      );

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }
}

export const redisService = new RedisService();
