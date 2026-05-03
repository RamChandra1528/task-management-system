import { Router } from "express";

import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} from "../controllers/projectController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getProjects);
router.post("/", authorize("admin", "member"), createProject);
router.get("/:id", getProjectById);
router.put("/:id", authorize("admin", "member"), updateProject);
router.delete("/:id", authorize("admin", "member"), deleteProject);

export default router;
