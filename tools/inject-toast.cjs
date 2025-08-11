const fs = require("fs");

const candidates = ["src/App.jsx", "src/App.tsx"];
const appPath = candidates.find(p => fs.existsSync(p));
if (!appPath) {
  console.error("Nie znaleziono src/App.jsx ani src/App.tsx");
  process.exit(1);
}
let code = fs.readFileSync(appPath, "utf8");
if (code.includes("[GRAZYNKA:TOAST:BEGIN]")) {
  console.log("Toast już wstrzyknięty — pomijam.");
  process.exit(0);
}

// 1) import React/useState
if (/from\s+["']react["']/.test(code)) {
  code = code.replace(
    /import\s+React(\s*,\s*{[^}]*})?\s*from\s*["']react["'];?/,
    (m) => {
      if (m.includes("useState")) return m;
      if (m.includes("{")) return m.replace("{", "{ useState, ");
      return `import React, { useState } from 'react';`;
    }
  );
} else {
  code = `import React, { useState } from 'react';\n` + code;
}

// 2) import Toast
if (!/from\s+["']\.\/Toast["']/.test(code)) {
  code = code.replace(/(^import[^\n]*\n)+/m, (imports) => imports + `import Toast from './Toast';\n`);
}

// 3) state + global
const stateBlock = `
  // [GRAZYNKA:TOAST:BEGIN]
  const [toast, setToast] = useState(null);
  if (typeof window !== 'undefined' && !window.gToast) {
    window.gToast = (opts) => setToast({ type: 'info', duration: 3000, ...opts });
  }
  // [GRAZYNKA:TOAST:END]
`;
let insertedState = false;
code = code.replace(
  /(function\s+App\s*\([^)]*\)\s*{\s*|const\s+App\s*=\s*\([^)]*\)\s*=>\s*{\s*)/,
  (m) => { insertedState = true; return m + stateBlock; }
);
if (!insertedState) {
  code = code.replace(/(^import[^\n]*\n)+/m, (imports)=> imports + stateBlock);
}

// 4) JSX obok TopBar lub zaraz po "return ("
const toastJSX = `
        {/* [GRAZYNKA:TOAST:BEGIN] */}
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        {/* [GRAZYNKA:TOAST:END] */}
`;
if (/<TopBar[\s\S]*?>/.test(code)) {
  code = code.replace(/(<TopBar[\s\S]*?>)/, (m) => m + toastJSX);
} else if (/return\s*\(\s*\n/.test(code)) {
  code = code.replace(/return\s*\(\s*\n/, (m) => m + toastJSX);
} else {
  code = code.replace(/return\s*\(/, (m) => m + toastJSX);
}

fs.writeFileSync(appPath, code, "utf8");
console.log("Wstrzyknięto toasty do", appPath);
