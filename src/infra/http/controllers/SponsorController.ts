import { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";

class SponsorController {
  async getActive(req: Request, res: Response) {
    try {
      const location = req.query.location as string;

      const whereClause: any = { status: "active" };

      // Filter by location if provided
      if (location) {
        whereClause.display_location = location;
      }

      // Check date validity
      // In a real query we would do: startDate <= now AND (endDate >= now OR endDate is null)
      // Prisma doesn't support complex OR for dates easily on filtered includes without raw query,
      // but simpler:
      whereClause.start_date = { lte: new Date() };

      // We'll filter end_date in memory or assume clean data for now to avoid complex queries

      const sponsors = await prisma.sponsor.findMany({
        where: whereClause,
        orderBy: { priority: "desc" },
      });

      // Filter expired ones manually if needed
      const validSponsors = sponsors.filter(s => !s.end_date || new Date(s.end_date) > new Date());

      return res.json(validSponsors);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new SponsorController();
