export interface ActivityEvent {
  id?: string;
  listing_id: string;
  user_id?: string;
  event_type: string;
  metadata?: Record<string, unknown>;
  created_at?: Date;
}
