/* global __APP_VERSION__ */
import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Bezpiecznik: gdyby define w Vite kiedykolwiek nie zadziałało
const V = (typeof __APP_VERSION__ !== "undefined") ? __APP_VERSION__ : "dev";
document.title = `Rolnik TYCOON v${V}`;

createRoot(document.getElementById("root")).render(<App />);
