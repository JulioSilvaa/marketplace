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

    // Aggregate metrics from activity_events
    const [viewsCount, contactsCount, favoritesCount, reviewsCount, recentEvents] =
      await Promise.all([
        // Count views
        prisma.activity_events.count({
          where: {
            listing_id: { in: spaceIds },
            event_type: "view",
          },
        }),

        // Count contacts (whatsapp + phone)
        prisma.activity_events.count({
          where: {
            listing_id: { in: spaceIds },
            event_type: { in: ["contact_whatsapp", "contact_phone"] },
          },
        }),

        // Count favorites
        prisma.activity_events.count({
          where: {
            listing_id: { in: spaceIds },
            event_type: "favorite_add",
          },
        }),

        // Count reviews
        prisma.activity_events.count({
          where: {
            listing_id: { in: spaceIds },
            event_type: "review",
          },
        }),

        // Get recent events (last 50)
        prisma.activity_events.findMany({
          where: {
            listing_id: { in: spaceIds },
          },
          orderBy: {
            created_at: "desc",
          },
          take: 50,
        }),
      ]);

    return {
      totalViews: viewsCount,
      totalContacts: contactsCount,
      totalFavorites: favoritesCount,
      totalReviews: reviewsCount,
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        listing_id: event.listing_id,
        event_type: event.event_type,
        created_at: event.created_at.toISOString(),
        metadata: event.metadata,
      })),
      dailyMetrics: [], // TODO: Implement daily aggregation if needed
    };
  }
}
