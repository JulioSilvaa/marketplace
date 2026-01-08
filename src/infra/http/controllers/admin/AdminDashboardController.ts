import { Request, Response } from "express";

import { prisma } from "../../../../lib/prisma";

class AdminDashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const [totalUsers, activeAds, totalViews] = await Promise.all([
        prisma.users.count(),
        prisma.spaces.count({ where: { status: "active" } }),
        prisma.spaces.aggregate({
          _sum: { views: true },
        }),
      ]);

      // Mock revenue for now as Subscription logic might be complex or empty
      const revenue = await prisma.subscriptions.aggregate({
        _sum: { price: true },
        where: { status: "active" },
      });

      return res.json({
        totalUsers,
        activeAds,
        totalViews: totalViews._sum.views || 0,
        revenue: revenue._sum.price || 0,
        // Calculate growth mocks for MVP
        growth: {
          users: 12, // +12%
          ads: 8,
          views: 15,
          revenue: 20,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  }

  async getCharts(req: Request, res: Response) {
    try {
      // Mock data for charts - in real app would use groupBy or raw query
      // Users Growth (last 7 days)
      const now = new Date();
      const labels = [];
      const userData = [];
      const adData = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        labels.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
        userData.push(Math.floor(Math.random() * 10) + 1); // Mock
        adData.push(Math.floor(Math.random() * 5)); // Mock
      }

      return res.json({
        usersStart: labels,
        usersSeries: [{ name: "Novos Usuários", data: userData }],
        adsSeries: [{ name: "Novos Anúncios", data: adData }],
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar dados de gráficos" });
    }
  }
  async getLists(req: Request, res: Response) {
    try {
      const [latestUsers, latestAds, mostVisitedAds] = await Promise.all([
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
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar listas" });
    }
  }
}

export default new AdminDashboardController();
