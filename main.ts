// Hearth Ledger — the entry program for make.fun's household budget bounty.
//
// It copies the site (app/) and its screenshots (screenshots/) into the
// output directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-frontend.ts. Node standard library only, no network, no
// timestamps anywhere in what it writes, so two runs produce the same bytes.

import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || "/output");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const name of ["app", "screenshots"]) {
  cpSync(join(repoRoot, name), join(outDir, name), { recursive: true });
}

writeFileSync(
  join(outDir, "dossier.json"),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
    app_path_max_bytes: 1000,
  }),
);

console.log(`Hearth Ledger entry written to ${outDir}`);
