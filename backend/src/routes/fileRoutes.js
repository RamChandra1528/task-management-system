import { Router } from "express";

import {
  addFileComment,
  createFolder,
  deleteFile,
  downloadFile,
  getFiles,
  updateFile,
  uploadFile
} from "../controllers/fileController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getFiles);
router.post("/folders", authorize("admin", "member"), createFolder);
router.post("/upload", authorize("admin", "member"), upload.single("file"), uploadFile);
router.put("/:id", authorize("admin", "member"), updateFile);
router.post("/:id/comments", authorize("admin", "member"), addFileComment);
router.get("/:id/download", downloadFile);
router.delete("/:id", authorize("admin"), deleteFile);

export default router;
