import { useEffect, useState } from "react";
import { APP_VERSION } from "../version";

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function TopBar({ money, dayLabel, seasonLabel }) {
  // numer wersji pochodzi z package.json -> tools/update-version.ps1 -> src/version.ts
  const version = APP_VERSION;
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const pref = localStorage.getItem("theme") ?? "light";
    if (pref === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-md dark:bg-neutral-900/70 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold tracking-tight">Rolnik TYCOON</span>
          <span className="rounded-full border px-2 py-0.5 text-xs text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700">
            v{version}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Stat label="Kasa" value={`${Number(money ?? 0).toLocaleString("pl-PL")} zł`} />
          <Stat label="Dzień" value={dayLabel ?? "-"} />
          <Stat label="Sezon" value={seasonLabel ?? "-"} />
          <button
            onClick={toggleTheme}
            className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
          >
            {dark ? "☀️ Jasny" : "🌙 Ciemny"}
          </button>
        </div>
      </div>
    </div>
  );
}
