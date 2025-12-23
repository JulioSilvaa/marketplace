import { ActivityEvent } from "../entities/ActivityEvent";

export interface IEventRepository {
  /**
   * Create multiple activity events in a single batch operation
   * @param events Array of activity events to create
   */
  createBatch(events: ActivityEvent[]): Promise<void>;
}
