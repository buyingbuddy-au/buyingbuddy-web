import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

let patched = false;

export function patchPdfKitFontPaths() {
  if (patched) return;
  patched = true;

  const originalReadFileSync = fs.readFileSync.bind(fs);
  const require = createRequire(import.meta.url);

  let dataDirectory: string | null = null;
  try {
    const packageJsonPath = require.resolve("pdfkit/package.json");
    dataDirectory = path.join(path.dirname(packageJsonPath), "js", "data");
  } catch {
    dataDirectory = null;
  }

  fs.readFileSync = ((filePath: fs.PathLike | fs.FileHandle, ...rest: unknown[]) => {
    const target = String(filePath).replace(/\\/g, "/");

    if (dataDirectory && /pdfkit\/js\/data\/(?:Helvetica|Courier|Times|Symbol|ZapfDingbats).*\.afm$/i.test(target)) {
      const fallback = path.join(dataDirectory, path.basename(target));
      if (fs.existsSync(fallback)) {
        return originalReadFileSync(fallback, ...(rest as Parameters<typeof originalReadFileSync>));
      }
    }

    return originalReadFileSync(filePath as fs.PathLike, ...(rest as Parameters<typeof originalReadFileSync>));
  }) as typeof fs.readFileSync;
}

patchPdfKitFontPaths();
