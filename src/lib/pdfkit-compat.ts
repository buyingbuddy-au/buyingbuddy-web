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
    const fallbackDirectory = path.join(process.cwd(), "node_modules", "pdfkit", "js", "data");
    dataDirectory = fs.existsSync(fallbackDirectory) ? fallbackDirectory : null;
  }

  const patchedReadFileSync = ((filePath: fs.PathOrFileDescriptor, ...args: unknown[]) => {
    const target = String(filePath).replace(/\\/g, "/");

    const basename = path.basename(target);
    if (dataDirectory && /^(?:Helvetica|Courier|Times|Symbol|ZapfDingbats).*\.afm$/i.test(basename)) {
      const fallback = path.join(dataDirectory, basename);
      if (fs.existsSync(fallback)) {
        return originalReadFileSync(fallback, ...(args as []));
      }
    }

    return originalReadFileSync(filePath, ...(args as []));
  }) as typeof fs.readFileSync;

  fs.readFileSync = patchedReadFileSync;
}

patchPdfKitFontPaths();
