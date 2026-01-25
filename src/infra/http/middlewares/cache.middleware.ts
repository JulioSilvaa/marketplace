import { NextFunction, Request, Response } from "express";

import { cacheGet, cacheSet, isCacheAvailable } from "../../cache/redis";

/**
 * Cache middleware for Express routes
 * Caches successful JSON responses based on request URL
 *
 * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @returns Express middleware function
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Check if cache is available
      const available = await isCacheAvailable();
      if (!available) {
        console.warn("⚠️  Cache not available, skipping cache middleware");
        return next();
      }

      // Try to get cached response
      const cached = await cacheGet(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheSet(cacheKey, data, ttl).catch((err: Error) => {
            console.error(`Failed to cache response for ${cacheKey}:`, err);
          });
        }

        // Call original json function
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      // Continue without caching if there's an error
      next();
    }
  };
};
