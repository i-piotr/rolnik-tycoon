// scripts/validate.js (Node ESM)
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function die(msg) { console.error("[VALIDATE]", msg); process.exit(1); }
function ok(msg) { console.log("[VALIDATE]", msg); }

function mustExist(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) die(`Brak pliku: ${rel}`);
  const stat = fs.statSync(p);
  if (stat.size === 0) die(`Plik jest pusty (0B): ${rel}`);
}

function mustHaveDefaultExport(rel) {
  const p = path.join(ROOT, rel);
  const txt = fs.readFileSync(p, "utf-8");
  if (!/export\s+default\s+/m.test(txt)) {
    die(`Brak "export default" w: ${rel}`);
  }
}

// 1) Krytyczne pliki
[
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/index.css",
  "src/utils/format.js",
  "src/utils/storage.js",
].forEach(mustExist);

// 2) Komponenty z eksportem domyślnym
[
  "src/App.jsx",
  "src/components/Header.jsx",
  "src/components/Toolbar.jsx",
  "src/components/Modal.jsx",
  "src/components/Barn.jsx",
  "src/components/Market.jsx",
  "src/components/Finance.jsx",
  "src/components/Jobs.jsx",
  "src/components/BuildingList.jsx",
  "src/components/PlotList.jsx",
].forEach((rel) => { mustExist(rel); mustHaveDefaultExport(rel); });

// 3) Testowa kompilacja (łapie złe importy)
try {
  ok("Uruchamiam testową kompilację (vite build)...");
  execSync("node node_modules/vite/bin/vite.js build --outDir .tmp-build --emptyOutDir", {
    stdio: "inherit",
    cwd: ROOT,
  });
  fs.rmSync(path.join(ROOT, ".tmp-build"), { recursive: true, force: true });
} catch {
  die("Vite build nie powiódł się — sprawdź błąd powyżej.");
}

ok("Wszystko wygląda dobrze ✅");
process.exit(0);
