import Redis from "ioredis";

let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        // Desiste após 3 tentativas
        if (times > 3) {
          console.warn("⚠️  Redis connection failed after 3 attempts. Giving up.");
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
      // Suporte a TLS para Upstash e outros serviços gerenciados
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
    });

    redisClient.on("error", err => {
      // Only log if we expect Redis to be available or if it's not a connection refused in dev
      if (process.env.REDIS_URL || (err as any).code !== "ECONNREFUSED") {
        console.error("❌ Redis Client Error:", err);
      }
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    // Removed: redisClient.on("ready") log to reduce noise

    // Removed: redisClient.on("close") log to reduce noise

    redisClient.on("reconnecting", () => {
      // Only log if we expect Redis to be available
      if (process.env.REDIS_URL) {
        console.log("🔄 Redis reconnecting...");
      }
    });
  }

  return redisClient;
};

/**
 * Connect to Redis
 */
export const connectRedis = async (): Promise<void> => {
  // Se REDIS_URL não estiver configurada, não tenta conectar
  if (!process.env.REDIS_URL) {
    console.warn("⚠️  REDIS_URL not configured. Running without cache.");
    return;
  }

  try {
    const client = getRedisClient();
    await client.connect();
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    // Não joga erro - permite que a aplicação continue sem cache
    console.warn("⚠️  Continuing without Redis cache");
  }
};

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

/**
 * Get value from cache
 */
export const cacheGet = async <T = any>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`❌ Cache GET error for key "${key}":`, error);
    return null;
  }
};

/**
 * Set value in cache with optional TTL (in seconds)
 */
export const cacheSet = async (key: string, value: any, ttl: number = 3600): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`❌ Cache SET error for key "${key}":`, error);
    return false;
  }
};

/**
 * Delete value from cache
 */
export const cacheDel = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`❌ Cache DEL error for key "${key}":`, error);
    return false;
  }
};

/**
 * Delete multiple keys matching a pattern
 */
export const cacheDelPattern = async (pattern: string): Promise<number> => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    const result = await client.del(...keys);
    return result;
  } catch (error) {
    console.error(`❌ Cache DEL PATTERN error for pattern "${pattern}":`, error);
    return 0;
  }
};

/**
 * Check if cache is available
 */
export const isCacheAvailable = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Export redis client instance for direct access
 */
export const redis = getRedisClient();
