/* global __APP_VERSION__ */
const V = (typeof __APP_VERSION__ !== "undefined") ? __APP_VERSION__ : "dev";
export const SAVE_KEY = `rolnik-tycoon-save-v${V}`;
