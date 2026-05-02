import { Router } from "express";

import {
  getWorkspace,
  updateWorkspace
} from "../controllers/workspaceController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getWorkspace);
router.put("/", authorize("admin"), updateWorkspace);

export default router;
