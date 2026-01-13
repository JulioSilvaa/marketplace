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
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redisClient.on("error", err => {
      console.error("❌ Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis ready to accept commands");
    });

    redisClient.on("close", () => {
      console.warn("⚠️  Redis connection closed");
    });

    redisClient.on("reconnecting", () => {
      console.log("🔄 Redis reconnecting...");
    });
  }

  return redisClient;
};

/**
 * Connect to Redis
 */
export const connectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.connect();
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    throw error;
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
