import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { APP_VERSION } from "./version";

// Wersja z src/version.ts
document.title = `Rolnik TYCOON v${APP_VERSION}`;

createRoot(document.getElementById("root")).render(<App />);
