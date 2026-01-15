import { redis } from "../redis";

// Cache TTL configuration (in seconds)
export const CACHE_TTL = {
  SPACES_LIST: 5 * 60, // 5 minutes
  SPACE_DETAIL: 10 * 60, // 10 minutes
  CATEGORIES: 60 * 60, // 1 hour
  USER_PROFILE: 15 * 60, // 15 minutes
  USER_SPACES: 10 * 60, // 10 minutes
};

/**
 * Cache strategy for Spaces
 * Handles caching of space listings, details, and user spaces
 */
export class SpaceCacheStrategy {
  /**
   * Generate cache key for space list
   */
  private static getListKey(filters: Record<string, unknown>): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = filters[key];
          return acc;
        },
        {} as Record<string, unknown>
      );

    return `spaces:list:${JSON.stringify(sortedFilters)}`;
  }

  /**
   * Generate cache key for space detail
   */
  private static getDetailKey(id: string): string {
    return `spaces:detail:${id}`;
  }

  /**
   * Generate cache key for user spaces
   */
  private static getUserSpacesKey(userId: string): string {
    return `spaces:user:${userId}`;
  }

  /**
   * Get cached space list
   */
  static async getSpacesList(filters: Record<string, unknown>): Promise<unknown | null> {
    try {
      const key = this.getListKey(filters);
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting cached spaces list:", error);
      return null;
    }
  }

  /**
   * Cache space list
   */
  static async setSpacesList(filters: Record<string, unknown>, data: unknown): Promise<void> {
    try {
      const key = this.getListKey(filters);
      await redis.setex(key, CACHE_TTL.SPACES_LIST, JSON.stringify(data));
    } catch (error) {
      console.error("Error caching spaces list:", error);
    }
  }

  /**
   * Get cached space detail
   */
  static async getSpaceDetail(id: string): Promise<unknown | null> {
    try {
      const key = this.getDetailKey(id);
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting cached space detail:", error);
      return null;
    }
  }

  /**
   * Cache space detail
   */
  static async setSpaceDetail(id: string, data: unknown): Promise<void> {
    try {
      const key = this.getDetailKey(id);
      await redis.setex(key, CACHE_TTL.SPACE_DETAIL, JSON.stringify(data));
    } catch (error) {
      console.error("Error caching space detail:", error);
    }
  }

  /**
   * Get cached user spaces
   */
  static async getUserSpaces(userId: string): Promise<unknown | null> {
    try {
      const key = this.getUserSpacesKey(userId);
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting cached user spaces:", error);
      return null;
    }
  }

  /**
   * Cache user spaces
   */
  static async setUserSpaces(userId: string, data: unknown): Promise<void> {
    try {
      const key = this.getUserSpacesKey(userId);
      await redis.setex(key, CACHE_TTL.USER_SPACES, JSON.stringify(data));
    } catch (error) {
      console.error("Error caching user spaces:", error);
    }
  }

  /**
   * Invalidate all space caches (call when space is created/updated/deleted)
   */
  static async invalidateAll(): Promise<void> {
    try {
      const keys = await redis.keys("spaces:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Error invalidating space caches:", error);
    }
  }

  /**
   * Invalidate specific space cache
   */
  static async invalidateSpace(id: string): Promise<void> {
    try {
      const key = this.getDetailKey(id);
      await redis.del(key);
      // Also invalidate lists as they might contain this space
      await this.invalidateAll();
    } catch (error) {
      console.error("Error invalidating space cache:", error);
    }
  }

  /**
   * Invalidate user spaces cache
   */
  static async invalidateUserSpaces(userId: string): Promise<void> {
    try {
      const key = this.getUserSpacesKey(userId);
      await redis.del(key);
    } catch (error) {
      console.error("Error invalidating user spaces cache:", error);
    }
  }
}
