import { Router } from "express";

import {
  addTaskComment,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask
} from "../controllers/taskController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getTasks);
router.post("/", authorize("admin", "member"), createTask);
router.get("/:id", getTaskById);
router.put("/:id", authorize("admin", "member"), updateTask);
router.delete("/:id", authorize("admin", "member"), deleteTask);
router.post("/:id/comments", authorize("admin", "member"), addTaskComment);

export default router;
