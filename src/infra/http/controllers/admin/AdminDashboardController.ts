import { Request, Response } from "express";

import { prisma } from "../../../../lib/prisma";

class AdminDashboardController {
  private getGrowth = async (model: any, where: any = {}) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [currentPeriod, previousPeriod] = await Promise.all([
      model.count({
        where: {
          ...where,
          created_at: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
      }),
      model.count({
        where: {
          ...where,
          created_at: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
    return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
  };

  getStats = async (req: Request, res: Response) => {
    try {
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

      const mmr = mmrResult._sum.price || 0;
      const totalViews = totalViewsResult._sum.views || 0;

      // Calculate Churn Rate
      const totalSubscriptions = subscriptionsStats.reduce((acc, curr) => acc + curr._count, 0);
      const canceledSubscriptions =
        subscriptionsStats.find(s => s.status === "canceled")?._count || 0;
      const churnRate =
        totalSubscriptions > 0 ? (canceledSubscriptions / totalSubscriptions) * 100 : 0;

      // Calculate Growth (Trends)
      // Note: Views growth is hard to calculate without a history table, defaulting to 0 or we'd need a separate analytics table.
      // We will calculate growth for Users, Ads (Spaces), and Revenue (Subscriptions)
      const [userGrowth, adGrowth, revenueGrowth] = await Promise.all([
        this.getGrowth(prisma.users),
        this.getGrowth(prisma.spaces, { status: "active" }), // active ads growth
        this.getGrowth(prisma.subscriptions, { status: "active" }), // active and paid subscriptions growth (proxy for revenue growth)
      ]);

      return res.json({
        totalUsers,
        activeAds,
        totalViews,
        revenue: mmr,
        mmr,
        churnRate: parseFloat(churnRate.toFixed(1)),
        growth: {
          users: parseFloat(userGrowth.toFixed(1)),
          ads: parseFloat(adGrowth.toFixed(1)),
          views: 0, // Not tracking historical views yet
          revenue: parseFloat(revenueGrowth.toFixed(1)),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  };

  getCharts = async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const labels = [];
      const userPromises = [];
      const adPromises = [];

      // Generate last 7 days queries
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        labels.push(startOfDay.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));

        userPromises.push(
          prisma.users.count({
            where: {
              created_at: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          })
        );

        adPromises.push(
          prisma.spaces.count({
            where: {
              created_at: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          })
        );
      }

      const [userData, adData] = await Promise.all([
        Promise.all(userPromises),
        Promise.all(adPromises),
      ]);

      return res.json({
        usersStart: labels,
        usersSeries: [{ name: "Novos Usuários", data: userData }],
        adsSeries: [{ name: "Novos Anúncios", data: adData }],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar dados de gráficos" });
    }
  };
  getLists = async (req: Request, res: Response) => {
    try {
      const [latestUsers, latestAds, mostVisitedAds, latestSubscriptions] = await Promise.all([
        prisma.users.findMany({
          take: 10,
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            created_at: true,
            spaces: {
              take: 1,
              select: {
                city: true,
                state: true,
              },
            },
          },
        }),
        prisma.spaces.findMany({
          take: 10,
          orderBy: { created_at: "desc" },
          include: {
            users: {
              select: { name: true, email: true },
            },
            category: {
              select: { name: true },
            },
          },
        }),
        prisma.spaces.findMany({
          take: 10,
          orderBy: { views: "desc" },
          include: {
            users: {
              select: { name: true },
            },
          },
        }),
        prisma.subscriptions.findMany({
          take: 10,
          orderBy: { next_billing_date: "asc" }, // Order by next billing
          include: {
            users: {
              select: { name: true, email: true },
            },
          },
        }),
      ]);

      const formattedUsers = latestUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        created_at: u.created_at,
        region: u.spaces[0] ? `${u.spaces[0].city}/${u.spaces[0].state}` : "N/A",
      }));

      return res.json({
        latestUsers: formattedUsers,
        latestAds,
        mostVisitedAds,
        latestSubscriptions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar listas" });
    }
  };
}

export default new AdminDashboardController();
