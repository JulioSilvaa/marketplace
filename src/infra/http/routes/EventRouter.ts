import { Router } from "express";

import { CreateBatchEvents } from "../../../core/useCases/events/CreateBatchEvents";
import { EventRepositoryPrisma } from "../../repositories/sql/EventRepositoryPrisma";
import { EventController } from "../controllers/EventController";

const router = Router();

// Initialize dependencies
const eventRepository = new EventRepositoryPrisma();
const createBatchEvents = new CreateBatchEvents(eventRepository);
const eventController = new EventController(createBatchEvents);

// Routes
router.post("/batch", (req, res) => eventController.createBatch(req, res));

export default router;
