import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import multer from "multer";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../../uploads/runtime");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const stamp = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${stamp}-${safeName}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024)
  }
});
