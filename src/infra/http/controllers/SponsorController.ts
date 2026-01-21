import { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { StripeService } from "../../services/StripeService";

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
      whereClause.start_date = { lte: new Date() };

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

  async checkout(req: Request, res: Response) {
    try {
      const { name, link_url, tier, user_id, banner_desktop_url, banner_mobile_url } = req.body;

      if (!name || !link_url || !tier || !user_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 1. Determine Price ID based on Tier
      let priceId = "";
      switch (tier.toUpperCase()) {
        case "BRONZE":
          priceId = process.env.STRIPE_PRICE_SPONSOR_BRONZE || "";
          break;
        case "SILVER":
          priceId = process.env.STRIPE_PRICE_SPONSOR_SILVER || "";
          break;
        case "GOLD":
          priceId = process.env.STRIPE_PRICE_SPONSOR_GOLD || "";
          break;
        default:
          return res.status(400).json({ error: "Invalid Tier" });
      }

      if (!priceId) {
        return res.status(500).json({ error: "Price configuration missing for this tier" });
      }

      // 2. Create Sponsor Record (Pending Payment)
      const sponsor = await prisma.sponsor.create({
        data: {
          name,
          link_url,
          tier: tier.toUpperCase(),
          display_location: "SIDEBAR", // Default or determine by Tier? Typically Gold=Home, Silver=Search etc. Let's default to sidebar for now or map it.
          // Applying mapping based on usual business logic if known, otherwise default.
          banner_desktop_url: banner_desktop_url || "",
          banner_mobile_url: banner_mobile_url || "",
          status: "pending_payment",
          start_date: new Date(), // Will be updated on activation? Or starts now but invisible?
          // end_date will be set by webhook on payment success
        }
      });

      // 3. Create Stripe Checkout Session
      const stripeService = new StripeService();
      const session = await stripeService.createSponsorCheckoutSession(
        sponsor.id,
        user_id,
        tier,
        priceId
      );

      return res.json({
        id: sponsor.id,
        checkoutUrl: session.url,
        sessionId: session.sessionId
      });

    } catch (error) {
      console.error("Sponsor checkout error:", error);
      return res.status(500).json({ error: "Internal server error during sponsor checkout" });
    }
  }
}

export default new SponsorController();
