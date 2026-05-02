import dotenv from "dotenv";

import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { bootstrapWorkspace } from "./seed/bootstrap.js";

dotenv.config();

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
