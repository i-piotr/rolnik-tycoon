/* global __APP_VERSION__ */

// Bezpiecznik na wypadek braku define w Vite
const APP_VERSION = (typeof __APP_VERSION__ !== 'undefined') ? __APP_VERSION__ : 'dev';
export const SAVE_KEY = `rolnik-tycoon-save-v${APP_VERSION}`;
const LEGACY_PREFIX = 'rolnik-tycoon-save-v';

// Wczytaj zapis: najpierw pod kluczem bieżącej wersji, potem spróbuj dowolny „legacy” klucz
export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Corrupted save under current key, trying legacy…', e);
  }

  // Fallback: znajdź pierwszy pasujący stary zapis (np. po zmianie wersji)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LEGACY_PREFIX)) {
        const v = localStorage.getItem(k);
        if (v) return JSON.parse(v);
      }
    }
  } catch (e) {
    console.warn('Failed to read legacy save:', e);
  }

  return null;
}

export function saveGame(state) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, json);
    return true;
  } catch (e) {
    console.error('saveGame failed:', e);
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.warn('clearSave failed:', e);
  }
}
