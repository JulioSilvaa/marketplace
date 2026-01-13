import { Request, Response } from "express";

import { prisma } from "../../../../lib/prisma";

class AdminDashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prev7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        prevTotalUsers,
        activeAds,
        prevActiveAds,
        totalViews,
        mmrData,
        prevMmrData,
        canceledLast30,
      ] = await Promise.all([
        prisma.users.count(),
        prisma.users.count({ where: { created_at: { lt: last7Days } } }),
        prisma.spaces.count({ where: { status: "active" } }),
        prisma.spaces.count({ where: { status: "active", created_at: { lt: last7Days } } }),
        prisma.spaces.aggregate({ _sum: { views: true } }),
        prisma.subscriptions.aggregate({
          _sum: { price: true },
          where: { status: "active" },
        }),
        prisma.subscriptions.aggregate({
          _sum: { price: true },
          where: { status: "active", created_at: { lt: last7Days } },
        }),
        prisma.subscriptions.count({
          where: {
            status: { in: ["cancelled", "cancelada"] },
            updated_at: { gte: last30Days },
          },
        }),
      ]);

      const mmr = mmrData._sum.price || 0;
      const prevMmr = prevMmrData._sum.price || 0;

      // Calculate Churn Rate: (Canceled in last 30d / Total Active)
      const churnRate = activeAds > 0 ? (canceledLast30 / activeAds) * 100 : 0;

      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return res.json({
        totalUsers,
        activeAds,
        totalViews: totalViews._sum.views || 0,
        revenue: mmr, // Keep revenue key for compatibility if needed, but frontend uses mmr
        mmr,
        churnRate: parseFloat(churnRate.toFixed(1)),
        growth: {
          users: Math.round(calculateGrowth(totalUsers, prevTotalUsers)),
          ads: Math.round(calculateGrowth(activeAds, prevActiveAds)),
          views: 15, // Keep some mocks if we don't have historical views yet
          revenue: Math.round(calculateGrowth(mmr, prevMmr)),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  }

  async getCharts(req: Request, res: Response) {
    try {
      const days = 7;
      const labels = [];
      const userData = [];
      const adData = [];

      for (let i = days - 1; i >= 0; i--) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - i);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const label = start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        labels.push(label);

        const [userCount, adCount] = await Promise.all([
          prisma.users.count({
            where: { created_at: { gte: start, lte: end } },
          }),
          prisma.spaces.count({
            where: { created_at: { gte: start, lte: end } },
          }),
        ]);

        userData.push(userCount);
        adData.push(adCount);
      }

      return res.json({
        usersStart: labels,
        usersSeries: [{ name: "Novos Usuários", data: userData }],
        adsSeries: [{ name: "Novos Anúncios", data: adData }],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar dados de gráficos" });
    }
  }

  async getLists(req: Request, res: Response) {
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
            subscriptions: {
              take: 1,
              orderBy: { created_at: "desc" },
              select: {
                plan: true,
                price: true,
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
          orderBy: { created_at: "desc" },
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
        plan: u.subscriptions?.[0]?.plan,
        planValue: u.subscriptions?.[0]?.price ? Number(u.subscriptions[0].price) : undefined,
      }));

      // Format subscriptions for frontend
      const formattedSubscriptions = latestSubscriptions.map(s => ({
        ...s,
        status: s.status.toLowerCase(),
        users: s.users || { name: "Usuário Removido", email: "N/A" },
      }));

      // Format ads to ensure user data exists
      const formattedLatestAds = latestAds.map(ad => ({
        ...ad,
        users: ad.users || { name: "Anunciante Removido", email: "N/A" },
      }));

      const formattedMostVisitedAds = mostVisitedAds.map(ad => ({
        ...ad,
        users: ad.users || { name: "Anunciante Removido" },
      }));

      return res.json({
        latestUsers: formattedUsers,
        latestAds: formattedLatestAds,
        mostVisitedAds: formattedMostVisitedAds,
        latestSubscriptions: formattedSubscriptions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar listas" });
    }
  }
}

export default new AdminDashboardController();
