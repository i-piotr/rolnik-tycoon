
import React, { useState } from "react";
import { CROP_LABELS, availableCropsForDate } from "../data/crops.js";
import { fmtHa } from "../utils/format.js";

export default function PlotList({
  date, list,
  arableQuery, setArableQuery,
  arableCropFilter, setArableCropFilter,
  arableSortKey, setArableSortKey,
  arableSortDir, setArableSortDir,
  openEdit, deletePlot, openForm,
  onAddPrep, onAddSow, onAddHarvest
}){
  const [sowChoice, setSowChoice] = useState({}); // plotId -> cropId

  const cropOptions = availableCropsForDate(date);

  return (
    <section className="bg-white rounded-3xl p-4 shadow">
      <div className="flex items-end justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold">Pola uprawne</h3>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">Szukaj
            <input value={arableQuery} onChange={(e)=>setArableQuery(e.target.value)} placeholder="np. Pole A" className="ml-2 rounded-lg border px-2 py-1"/>
          </label>
          <label className="text-sm">Uprawa
            <select value={arableCropFilter} onChange={(e)=>setArableCropFilter(e.target.value)} className="ml-2 rounded-lg border px-2 py-1">
              <option value="wszystko">Wszystko</option>
              {cropOptions.map(id=> <option key={id} value={id}>{CROP_LABELS[id]}</option>)}
            </select>
          </label>
          <label className="text-sm">Sortuj wg
            <select value={arableSortKey} onChange={(e)=>setArableSortKey(e.target.value)} className="ml-2 rounded-lg border px-2 py-1">
              <option value="name">Nazwa</option>
              <option value="area">Powierzchnia</option>
            </select>
          </label>
          <label className="text-sm">Kierunek
            <select value={arableSortDir} onChange={(e)=>setArableSortDir(e.target.value)} className="ml-2 rounded-lg border px-2 py-1">
              <option value="asc">Rosnąco</option>
              <option value="desc">Malejąco</option>
            </select>
          </label>
          <button onClick={()=>openForm("arable")} className="rounded-xl px-3 py-1.5 border font-medium hover:bg-gray-50">Dodaj pole</button>
        </div>
      </div>

      {list.length===0 ? <p className="text-sm text-gray-600">Brak pól. Użyj „Dodaj pole”.</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-1 pr-2">Nazwa</th>
                <th className="py-1 pr-2">Powierzchnia</th>
                <th className="py-1 pr-2">Uprawa</th>
                <th className="py-1 pr-2">Wzrost</th>
                <th className="py-1 pr-2 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {list.map(p=>{
                const grow = p.grow;
                const progress = grow && grow.growable ? Math.min(100, Math.round(100* (grow.growthDaysElapsed||0) / (grow.growthDaysRequired||1))) : 0;
                return (
                  <tr key={p.id} className="border-t">
                    <td className="py-1 pr-2 font-medium">{p.name}</td>
                    <td className="py-1 pr-2">{p.areaM2.toLocaleString("pl-PL")} m² <span className="text-gray-500">({fmtHa(p.areaM2)} ha)</span></td>
                    <td className="py-1 pr-2">{CROP_LABELS[p.crop || "trawa"]}</td>
                    <td className="py-1 pr-2">{grow && grow.growable ? (grow.isReady ? "Do zbioru" : `${progress}%`) : "—"}</td>
                    <td className="py-1 pr-2 text-right">
                      <button onClick={()=>openEdit(p)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 mr-2">Edytuj</button>
                      <button onClick={()=>deletePlot(p.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 text-red-700 mr-2">Usuń</button>
                      {!p.tilled && <button onClick={()=>onAddPrep(p.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 mr-2">Przygotuj</button>}
                      <span className="inline-flex items-center gap-1 mr-2">
                        <select value={sowChoice[p.id] || ""} onChange={(e)=>setSowChoice(sc=>({...sc, [p.id]: e.target.value}))} className="rounded-lg border px-2 py-1 text-xs">
                          <option value="">Siew…</option>
                          {cropOptions.map(id=> <option key={id} value={id}>{CROP_LABELS[id]}</option>)}
                        </select>
                        <button
                          onClick={()=>{ if(sowChoice[p.id]) onAddSow(p.id, sowChoice[p.id]); }}
                          className="rounded-lg px-2 py-1 border hover:bg-gray-50 text-xs"
                        >OK</button>
                      </span>
                      {p.grow && p.grow.isReady && <button onClick={()=>onAddHarvest(p.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50">Zbiór</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
