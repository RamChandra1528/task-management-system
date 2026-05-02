import { Router } from "express";

import {
  createTeam,
  deleteTeam,
  getTeams,
  updateTeam
} from "../controllers/teamController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getTeams);
router.post("/", authorize("admin"), createTeam);
router.put("/:id", authorize("admin"), updateTeam);
router.delete("/:id", authorize("admin"), deleteTeam);

export default router;
