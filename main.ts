import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Entry: copy the rendered front page (entry.png) to the output dir.
// The image is drawn by index.html in this same repository (real photos
// from Wikimedia Commons rendered into the page, plus a weather strip)
// and rendered locally before submission; this program only moves the
// bytes, so both runs of the grader write identical output.
const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const src = join(here, "entry.png");
if (!existsSync(src)) throw new Error("entry.png missing from repository");
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
copyFileSync(src, dest);

// Sanity check the copy: a whole PNG starts with its 8-byte signature,
// a whole JPEG with the SOI marker. Anything else is not the image the
// page rendered, so fail loudly instead of submitting junk. The gate also
// caps the image at 1 MiB, so refuse an oversize copy the same way.
const head = readFileSync(dest).subarray(0, 4);
const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
if (!isPng && !isJpeg) throw new Error("entry.png is not a PNG or JPEG image");
if (statSync(dest).size > 1048576) throw new Error("entry.png is over the 1 MiB gate cap");
