import { Router } from "express";

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent
} from "../controllers/eventController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getEvents);
router.post("/", authorize("admin", "member"), createEvent);
router.put("/:id", authorize("admin", "member"), updateEvent);
router.delete("/:id", authorize("admin"), deleteEvent);

export default router;
