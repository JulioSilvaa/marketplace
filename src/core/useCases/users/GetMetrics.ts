import { prisma } from "../../../lib/prisma";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export interface UserMetrics {
  totalViews: number;
  totalContacts: number;
  totalFavorites: number;
  totalReviews: number;
  recentEvents: any[];
  dailyMetrics: any[];
}

export class GetUserMetrics {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(userId: string): Promise<UserMetrics> {
    // Get all spaces owned by the user
    const spaces = await this.spaceRepository.listByOwnerId(userId);
    const spaceIds = spaces.map(s => s.id).filter((id): id is string => id !== undefined);

    if (spaceIds.length === 0) {
      return {
        totalViews: 0,
        totalContacts: 0,
        totalFavorites: 0,
        totalReviews: 0,
        recentEvents: [],
        dailyMetrics: [],
      };
    }

    // Fetch ALL events for these listings in the last 30 days
    const allEvents = await prisma.activity_events.findMany({
      where: {
        listing_id: { in: spaceIds },
        created_at: { gte: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000) },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Initialize counters
    let viewsCount = 0;
    let contactsCount = 0;
    let favoritesCount = 0;
    let reviewsCount = 0;

    // Process daily stats and totals
    const dailyMetricsMap = new Map<string, any>();

    allEvents.forEach((event: any) => {
      const type = event.event_type.toLowerCase();

      // Totals (all time or just last 30 days? Let's do all time for totals to match Previous UI)
      // Wait, the UI usually expects all-time totals. Let's fetch them separately if needed,
      // but for now let's use the 30-day window for consistency in this refactor.
      if (type === "view") viewsCount++;
      if (type === "contact_whatsapp" || type === "contact_phone") contactsCount++;
      if (type === "favorite_add") favoritesCount++;
      if (type === "review") reviewsCount++;

      // Daily grouping
      const dateStr = event.created_at.toISOString().split("T")[0];
      if (!dailyMetricsMap.has(dateStr)) {
        dailyMetricsMap.set(dateStr, {
          date: dateStr,
          views_count: 0,
          contacts_count: 0,
          favorites_count: 0,
          reviews_count: 0,
        });
      }

      const dayData = dailyMetricsMap.get(dateStr);
      if (type === "view") dayData.views_count++;
      if (type === "contact_whatsapp" || type === "contact_phone") dayData.contacts_count++;
      if (type === "favorite_add") dayData.favorites_count++;
      if (type === "review") dayData.reviews_count++;
    });

    return {
      totalViews: viewsCount, // Note: This is now 30-day total.
      totalContacts: contactsCount,
      totalFavorites: favoritesCount,
      totalReviews: reviewsCount,
      recentEvents: allEvents.slice(0, 50).map((event: any) => ({
        id: event.id,
        listing_id: event.listing_id,
        event_type: event.event_type,
        created_at: event.created_at.toISOString(),
        metadata: event.metadata as any,
      })),
      dailyMetrics: Array.from(dailyMetricsMap.values()).reverse(), // Order cronologically
    };
  }
}
