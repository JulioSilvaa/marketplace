import { ActivityEvent } from "../../entities/ActivityEvent";
import { IEventRepository } from "../../repositories/IEventRepository";

export class CreateBatchEvents {
  constructor(private eventRepository: IEventRepository) {}

  async execute(events: ActivityEvent[]): Promise<void> {
    // Validate events
    if (!events || events.length === 0) {
      throw new Error("No events provided");
    }

    // Validate each event has required fields
    for (const event of events) {
      if (!event.listing_id) {
        throw new Error("listing_id is required for all events");
      }
      if (!event.event_type) {
        throw new Error("event_type is required for all events");
      }
    }

    // Create events in batch
    await this.eventRepository.createBatch(events);
  }
}
