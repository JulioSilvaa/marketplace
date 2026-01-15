import { Request, Response } from "express";
import Stripe from "stripe";

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
        newMmrData,
        churnedMmrData,
        activeSubscriptionsCount,
        prevActiveSubscriptionsCount, // Valid approximation for active 30 days ago
        newSubscriptionsCount,
        canceledSubscriptionsCount,
        inactiveAds,
        suspendedAds,
        deletedAds,
        canceledPlans,
      ] = await Promise.all([
        prisma.users.count(),
        prisma.users.count({ where: { created_at: { lt: last7Days } } }),
        prisma.spaces.count({ where: { status: "active" } }),
        prisma.spaces.count({ where: { status: "active", created_at: { lt: last7Days } } }),
        prisma.spaces.aggregate({ _sum: { views: true } }),
        // Total MMR
        prisma.subscriptions.aggregate({
          _sum: { price: true },
          where: { status: "active" },
        }),
        // Previous MMR (Approx for Growth calc - simple logic)
        prisma.subscriptions.aggregate({
          _sum: { price: true },
          where: { status: "active", created_at: { lt: last30Days } }, // This isn't perfect for "MMR 30 days ago" but serves as a baseline for "old" revenue vs new
        }),
        // New MMR (Revenue from subs created in last 30d)
        prisma.subscriptions.aggregate({
          _sum: { price: true },
          where: { status: "active", created_at: { gte: last30Days } },
        }),
        // Churned MMR (Revenue lost in last 30d)
        prisma.subscriptions.aggregate({
          _sum: { price: true },
          where: {
            OR: [{ status: { in: ["cancelled", "cancelada"] } }, { cancel_at_period_end: true }],
            updated_at: { gte: last30Days },
          },
        }),
        // Active Subs Count (Current)
        prisma.subscriptions.count({ where: { status: "active" } }),
        // Active Subs Count (Older than 30d) - Start of Period Proxy? No, this is just "Existing before 30d".
        // Better Start of Period metric: Current Active + Cancelled(Last30) - New(Last30)
        // We will calc in memory. We just need the raw counts here.
        prisma.subscriptions.count({ where: { status: "active", created_at: { lt: last30Days } } }),

        // New Subs Count (Last 30d)
        prisma.subscriptions.count({
          where: { status: "active", created_at: { gte: last30Days } },
        }),

        // Canceled Subs Count (Last 30d)
        prisma.subscriptions.count({
          where: {
            OR: [{ status: { in: ["cancelled", "cancelada"] } }, { cancel_at_period_end: true }],
            updated_at: { gte: last30Days },
          },
        }),

        prisma.spaces.count({ where: { status: "inactive" } }),
        prisma.spaces.count({ where: { status: "suspended" } }),
        prisma.spaces.count({ where: { status: "deleted" } }),
        prisma.subscriptions.count({
          where: { OR: [{ status: "cancelled" }, { cancel_at_period_end: true }] },
        }),
      ]);

      const mmr = mmrData._sum.price || 0;
      const prevMmr = prevMmrData._sum.price || 0; // Only captures older retained revenue, not true "MMR 30 days ago" history without snapshots.

      const newMmr = newMmrData._sum.price || 0;
      const churnedMmr = churnedMmrData._sum.price || 0;

      // --- Churn Rate Calculations ---
      // Customer Churn Rate = Cancelled Customers / Customers at Start of Period
      // Start Customers = (End Customers[Active] + Cancelled Customers[Last30]) - New Customers[Last30]
      const currentActiveSubs = activeSubscriptionsCount;
      const startOfPeriodSubs =
        currentActiveSubs + canceledSubscriptionsCount - newSubscriptionsCount;

      const customerChurnRate =
        startOfPeriodSubs > 0 ? (canceledSubscriptionsCount / startOfPeriodSubs) * 100 : 0;

      // Revenue Churn Rate = Churned MMR / MMR at Start of Period
      // Start MMR = (End MMR[Active] + Churned MMR[Last30]) - New MMR[Last30]
      const startOfPeriodMmr = mmr + churnedMmr - newMmr;

      const revenueChurnRate = startOfPeriodMmr > 0 ? (churnedMmr / startOfPeriodMmr) * 100 : 0;

      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      // MMR Growth (Month over Month approx)
      // Real growth = (New MMR - Churned MMR) / Start MMR
      const mmrCheckGrowth =
        startOfPeriodMmr > 0 ? ((newMmr - churnedMmr) / startOfPeriodMmr) * 100 : 0;

      return res.json({
        totalUsers,
        activeAds,
        inactiveAds,
        canceledAds: suspendedAds,
        deletedAds,
        canceledPlans,
        totalViews: totalViews._sum.views || 0,
        revenue: mmr,
        mmr,
        newMmr,
        churnedMmr,
        churnRate: parseFloat(customerChurnRate.toFixed(1)), // Keeping generic name for compatibility
        revenueChurnRate: parseFloat(revenueChurnRate.toFixed(1)),
        growth: {
          users: Math.round(calculateGrowth(totalUsers, prevTotalUsers)),
          ads: Math.round(calculateGrowth(activeAds, prevActiveAds)),
          views: 15,
          revenue: parseFloat(mmrCheckGrowth.toFixed(1)), // Use the calculated MoM growth
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

      // Resolve Coupon Names
      const uniqueCoupons = [
        ...new Set(
          latestSubscriptions.map(s => s.coupon_code).filter(c => c !== null && c !== undefined)
        ),
      ];
      const couponMap: Record<string, string> = {};

      if (uniqueCoupons.length > 0 && process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2025-01-27.acacia" as any,
          });

          await Promise.all(
            uniqueCoupons.map(async code => {
              if (!code) return;
              try {
                // Try to retrieve as a coupon ID
                const coupon = await stripe.coupons.retrieve(code);
                couponMap[code] = coupon.name || code;
              } catch (error) {
                // If not found (e.g., it's a promo code string like 'BLACKFRIDAY' that isn't a coupon ID), keep original
                couponMap[code] = code;
              }
            })
          );
        } catch (err) {
          console.error("Error resolving coupons:", err);
          // Fallback: keep codes as they are
        }
      }

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
        coupon_code: s.coupon_code ? couponMap[s.coupon_code] || s.coupon_code : null,
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
