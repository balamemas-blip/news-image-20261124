// news-image-20261124 — entrypoint.
// Copies the pre-drawn front page (entry.png, in this repository) to the
// output directory as /output/entry.png, deterministically.
// Node 22, standard library only. No network, no dependencies.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576; // 1 MiB

const repoDir = dirname(fileURLToPath(import.meta.url));
const src = join(repoDir, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const dst = join(outDir, "entry.png");

const data = readFileSync(src);
if (data.length < PNG_MAGIC.length || !data.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is not a PNG (bad magic bytes)");
}
if (data.length > MAX_BYTES) {
  throw new Error(`entry.png is ${data.length} bytes, over the 1 MiB limit`);
}
mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);
const written = statSync(dst).size;
if (written !== data.length) {
  throw new Error(`short write: ${written} of ${data.length} bytes`);
}
// Re-read the copy and confirm it is still a whole PNG before reporting.
const back = readFileSync(dst);
if (!back.subarray(0, 8).equals(PNG_MAGIC) || back.length !== data.length) {
  throw new Error("output copy failed verification");
}
console.log(`entry.png written: ${written} bytes -> ${dst} (verified)`);
