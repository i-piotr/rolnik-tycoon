import React from "react";
export default function Toolbar({ freeM2, minPlotM2, onAddField, onAddBuild }){
  return (<div className="sticky top-[52px] z-10 bg-white/90 backdrop-blur border-b">
    <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
      <button onClick={onAddField} disabled={freeM2<minPlotM2} className="border rounded-xl px-3 py-1.5 disabled:opacity-50">➕ Dodaj pole</button>
      <button onClick={onAddBuild} disabled={freeM2<minPlotM2} className="border rounded-xl px-3 py-1.5 disabled:opacity-50">🏠 Dodaj teren pod zabudowę</button>
      <span className="text-sm text-gray-600">Wolne: {(freeM2/10000).toFixed(4)} ha</span>
    </div></div>);
}
