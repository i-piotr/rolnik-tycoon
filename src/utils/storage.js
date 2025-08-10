const SAVE_KEY="rolnik-tycoon-save-v0.8.3";
export function loadSave(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?JSON.parse(raw):null;}catch{return null;}}
export function saveGame(s){try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch{}}
export function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch{}}
