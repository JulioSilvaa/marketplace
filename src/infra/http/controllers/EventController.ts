import { Request, Response } from "express";

import { CreateBatchEvents } from "../../../core/useCases/events/CreateBatchEvents";

export class EventController {
  constructor(private createBatchEvents: CreateBatchEvents) {}

  async createBatch(req: Request, res: Response): Promise<Response> {
    try {
      const { events } = req.body;

      if (!events || !Array.isArray(events)) {
        return res.status(400).json({
          error: "Invalid request body. Expected { events: ActivityEvent[] }",
        });
      }

      await this.createBatchEvents.execute(events);

      return res.status(201).json({
        message: "Events created successfully",
        count: events.length,
      });
    } catch (error) {
      console.error("Error creating batch events:", error);

      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
