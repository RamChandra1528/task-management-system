import dotenv from "dotenv";

import { connectDatabase } from "../config/db.js";
import { bootstrapWorkspace } from "../seed/bootstrap.js";

dotenv.config();

async function run() {
  await connectDatabase(process.env.MONGODB_URI);
  await bootstrapWorkspace({ force: true });
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
