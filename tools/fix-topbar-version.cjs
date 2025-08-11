const fs = require("fs");
const path = require("path");

const candidates = [
  "src/components/TopBar.jsx","src/TopBar.jsx","src/ui/TopBar.jsx",
  "src/components/TopBar.tsx","src/TopBar.tsx","src/ui/TopBar.tsx"
];

let touched = 0;
for (const rel of candidates) {
  const p = path.resolve(rel);
  if (!fs.existsSync(p)) continue;

  let src = fs.readFileSync(p, "utf8");
  const dir = path.dirname(p);

  let relToVersion = path.relative(dir, path.resolve("src/version")).replace(/\\/g,"/");
  if (!relToVersion.startsWith(".")) relToVersion = "./" + relToVersion;
  const importLine = `import { APP_VERSION } from '${relToVersion}';`;

  if (!/from\s+['"].*version['"]/.test(src)) {
    src = src.replace(/(^import[^\n]*\n)+/m, (imports)=> imports + importLine + "\n");
  }

  const pattern = /(>[^<]*?Rolnik\s*TYCOON\s*v[0-9A-Za-z.\-]+[^<]*<)/g;
  if (pattern.test(src)) {
    src = src.replace(pattern, m =>
      m.replace(/Rolnik\s*TYCOON\s*v[0-9A-Za-z.\-]+/, "{'Rolnik TYCOON v' + APP_VERSION}")
    );
    fs.writeFileSync(p, src, "utf8");
    console.log("Zaktualizowano wersję w", rel);
    touched++;
    continue;
  }

  const pattern2 = /(['"])Rolnik\s*TYCOON\s*v[0-9A-Za-z.\-]+\1/g;
  if (pattern2.test(src)) {
    src = src.replace(pattern2, "{'Rolnik TYCOON v' + APP_VERSION}");
    fs.writeFileSync(p, src, "utf8");
    console.log("Zaktualizowano wersję (quoted) w", rel);
    touched++;
  } else {
    console.log("Nie znaleziono twardo osadzonej wersji w", rel);
  }
}

if (touched === 0) {
  console.log("Uwaga: żaden TopBar nie został zmieniony. Daj ścieżkę, jeśli masz TopBar gdzie indziej.");
}
