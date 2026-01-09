import { prisma } from "../lib/prisma";

async function check() {
  try {
    console.log("Checking DB connection...");
    const userCount = await prisma.users.count();
    console.log(`Users: ${userCount}`);

    console.log("Checking AdminDashboard queries...");
    // Replicating getStats logic
    const start = Date.now();
    const [totalUsers, activeAds, totalViewsResult, mmrResult, subscriptionsStats] =
      await Promise.all([
        prisma.users.count(),
        prisma.spaces.count({ where: { status: "active" } }),
        prisma.spaces.aggregate({
          _sum: { views: true },
        }),
        prisma.subscriptions.aggregate({
          _sum: { price: true },
          where: { status: "active" },
        }),
        prisma.subscriptions.groupBy({
          by: ["status"],
          _count: true,
        }),
      ]);
    console.log("Stats fetched in " + (Date.now() - start) + "ms");
    console.log({ totalUsers, activeAds, totalViewsResult, mmrResult, subscriptionsStats });

    // Check growth logic
    console.log("Checking Growth Logic...");
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowthVal = await prisma.users.count({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
          lte: today,
        },
      },
    });
    console.log(`Users last 30 days: ${userGrowthVal}`);

    console.log("Checking Subscriptions Growth (should fail if no created_at)...");
    const subGrowthVal = await prisma.subscriptions.count({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
          lte: today,
        },
      },
    });
    console.log(`Subs last 30 days: ${subGrowthVal}`);
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
