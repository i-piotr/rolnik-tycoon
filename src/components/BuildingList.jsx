
import React from "react";
import { fmtHa } from "../utils/format.js";

export default function BuildingList({
  list, buildQuery, setBuildQuery, buildSortKey, setBuildSortKey, buildSortDir, setBuildSortDir,
  openEdit, deletePlot, openForm
}){
  return (
    <section className="bg-white rounded-3xl p-4 shadow">
      <div className="flex items-end justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold">Działki pod zabudowę</h3>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">Szukaj
            <input value={buildQuery} onChange={(e)=>setBuildQuery(e.target.value)} placeholder="np. Zabudowa A" className="ml-2 rounded-lg border px-2 py-1"/>
          </label>
          <label className="text-sm">Sortuj wg
            <select value={buildSortKey} onChange={(e)=>setBuildSortKey(e.target.value)} className="ml-2 rounded-lg border px-2 py-1">
              <option value="name">Nazwa</option><option value="area">Powierzchnia</option></select></label>
          <label className="text-sm">Kierunek
            <select value={buildSortDir} onChange={(e)=>setBuildSortDir(e.target.value)} className="ml-2 rounded-lg border px-2 py-1"><option value="asc">Rosnąco</option><option value="desc">Malejąco</option></select></label>
          <button onClick={()=>openForm("build")} className="rounded-xl px-3 py-1.5 border font-medium hover:bg-gray-50">Dodaj teren pod zabudowę</button>
        </div>
      </div>
      {list.length===0 ? <p className="text-sm text-gray-600">Brak działek. Użyj „Dodaj teren pod zabudowę”.</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm"><thead><tr className="text-left text-gray-600"><th className="py-1 pr-2">Nazwa</th><th className="py-1 pr-2">Powierzchnia</th><th className="py-1 pr-2 text-right">Akcje</th></tr></thead>
            <tbody>
              {list.map(p=> (
                <tr key={p.id} className="border-t">
                  <td className="py-1 pr-2 font-medium">{p.name}{p.fixed && <span className="ml-2 text-xs text-gray-500">(stała)</span>}</td>
                  <td className="py-1 pr-2">{p.areaM2.toLocaleString("pl-PL")} m² <span className="text-gray-500">({fmtHa(p.areaM2)} ha)</span></td>
                  <td className="py-1 pr-2 text-right">
                    {!p.fixed ? (<>
                      <button onClick={()=>openEdit(p)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 mr-2">Edytuj</button>
                      <button onClick={()=>deletePlot(p.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 text-red-700">Usuń</button>
                    </>) : (<span className="text-xs text-gray-500">—</span>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
