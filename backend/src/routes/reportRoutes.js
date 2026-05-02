import { Router } from "express";

import { getReportsSummary } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/summary", getReportsSummary);

export default router;
