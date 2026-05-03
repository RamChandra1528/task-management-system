import path from "node:path";
import url from "node:url";

import dotenv from "dotenv";

import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { bootstrapWorkspace } from "./seed/bootstrap.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/taskpro";
process.env.JWT_SECRET ||= "super-secret-taskpro-key";
process.env.CLIENT_URL ||= "http://localhost:5173";

const port = Number(process.env.PORT || 5000);
const app = createApp();

async function start() {
  await connectDatabase(process.env.MONGODB_URI);

  if (String(process.env.SEED_ON_START).toLowerCase() === "true") {
    await bootstrapWorkspace();
  }

  app.listen(port, () => {
    console.log(`TaskPro API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
