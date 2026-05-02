import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import vm from "node:vm";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "src");

const files = [];

function walk(target) {
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const next = path.join(target, entry.name);
    if (entry.isDirectory()) {
      walk(next);
      continue;
    }
    if (entry.isFile() && next.endsWith(".js")) {
      files.push(next);
    }
  }
}

walk(root);

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const transformed = source
    .replace(/import\s+[\s\S]*?from\s+["'][^"']+["'];?/g, "")
    .replace(/import\s+["'][^"']+["'];?/g, "")
    .replace(/\bexport\s+(default\s+)?/g, "")
    .replace(/import\.meta\.url/g, '"file:///verify.js"');

  new vm.Script(transformed, { filename: file });
}

console.log(`Verified ${files.length} JavaScript files.`);
