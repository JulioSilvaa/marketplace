import { Redis } from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

async function main() {
  console.log("--- Clearing Spaces Cache ---");
  const keys = await redis.keys("spaces:search*");
  if (keys.length > 0) {
    console.log(`Deleting ${keys.length} keys...`);
    await redis.del(...keys);
    console.log("Done.");
  } else {
    console.log("No keys found.");
  }

  // Also clear individual space cache if needed
  const spaceKeys = await redis.keys("space:*");
  if (spaceKeys.length > 0) {
    console.log(`Deleting ${spaceKeys.length} space detail keys...`);
    await redis.del(...spaceKeys);
  }

  redis.disconnect();
}

main().catch(console.error);
