import { ActivityEvent } from "../../../core/entities/ActivityEvent";
import { IEventRepository } from "../../../core/repositories/IEventRepository";

export class EventRepositoryInMemory implements IEventRepository {
  private events: ActivityEvent[] = [];

  async create(event: ActivityEvent): Promise<void> {
    this.events.push(event);
  }

  async createBatch(events: ActivityEvent[]): Promise<void> {
    this.events.push(...events);
  }

  async findByListingId(listingId: string): Promise<ActivityEvent[]> {
    return this.events.filter(event => event.listing_id === listingId);
  }

  async findByUserId(userId: string): Promise<ActivityEvent[]> {
    return this.events.filter(event => event.user_id === userId);
  }

  async findRecentByUserId(userId: string, limit: number): Promise<ActivityEvent[]> {
    return this.events.filter(event => event.user_id === userId).slice(0, limit);
  }

  // Helper method for tests
  getAll(): ActivityEvent[] {
    return this.events;
  }

  clear(): void {
    this.events = [];
  }
}
