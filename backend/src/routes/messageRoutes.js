import { Router } from "express";

import {
  createConversation,
  getConversationById,
  getConversations,
  postMessage
} from "../controllers/messageController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/conversations", getConversations);
router.post("/conversations", authorize("admin", "member"), createConversation);
router.get("/conversations/:id", getConversationById);
router.post("/conversations/:id/messages", authorize("admin", "member"), postMessage);

export default router;
