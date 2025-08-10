/* global __APP_VERSION__ */
import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Ustaw tytuł karty z wersją z package.json (wstrzykniętą przez Vite)
document.title = `Rolnik TYCOON v${__APP_VERSION__}`;

createRoot(document.getElementById("root")).render(<App />);
