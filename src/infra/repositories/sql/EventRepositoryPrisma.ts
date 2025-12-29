import { randomUUID } from "crypto";

import { ActivityEvent } from "../../../core/entities/ActivityEvent";
import { IEventRepository } from "../../../core/repositories/IEventRepository";
import { prisma } from "../../../lib/prisma";

export class EventRepositoryPrisma implements IEventRepository {
  async createBatch(events: ActivityEvent[]): Promise<void> {
    // Generate IDs for events that don't have one
    const eventsWithIds = events.map(event => ({
      id: event.id || randomUUID(),
      listing_id: event.listing_id,
      user_id: event.user_id || null,
      event_type: event.event_type,
      metadata: event.metadata || undefined,
      created_at: event.created_at || new Date(),
    }));

    await prisma.activity_events.createMany({
      data: eventsWithIds as any,
      skipDuplicates: true,
    });
  }
}
