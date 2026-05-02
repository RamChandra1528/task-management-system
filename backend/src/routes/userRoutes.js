import { Router } from "express";

import {
  createUser,
  deleteMe,
  deleteUser,
  getUserById,
  getUsers,
  updateMePreferences,
  updateMeProfile,
  updateUser
} from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getUsers);
router.post("/", authorize("admin"), createUser);
router.put("/me/profile", updateMeProfile);
router.put("/me/preferences", updateMePreferences);
router.delete("/me", deleteMe);
router.get("/:id", getUserById);
router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
