v0.8.3c — kompatybilność z Tailwind v3
- Usunięto @tailwindcss/postcss (sprawiał problemy z wersją).
- Wrócono do tailwindcss jako plugin PostCSS (v3.4.10).

Kroki czyste:
  1) Zamknij dev server.
  2) Usuń node_modules i package-lock.json (jeśli pliki istnieją).
  3) npm install
  4) npm run dev
