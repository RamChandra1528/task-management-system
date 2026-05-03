import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import multer from "multer";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../../uploads/runtime");

// Try to create upload directory, but don't fail if filesystem is read-only (Vercel)
try {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✓ Upload directory created:", uploadDir);
} catch (error) {
  if (error.code === "EACCES" || error.code === "EROFS") {
    console.warn("⚠️ Upload directory is read-only (Vercel serverless). Uploads may not persist.");
  } else {
    console.error("❌ Failed to create upload directory:", error.message);
  }
}

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
