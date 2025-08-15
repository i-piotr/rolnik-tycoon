
import React, { useState } from "react";
import { CROP_LABELS } from "../data/crops.js";
import { priceFor } from "../data/prices.js";

export default function Market({ date, inventory, onSell }){
  const rows = Object.entries(inventory || {}).filter(([_,q])=>q>0);
  const [qty, setQty] = useState({});
  return (
    <section className="bg-white rounded-3xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Rynek (sprzedaż)</h3>
      {rows.length===0 ? <p className="text-sm text-gray-600">Brak towaru na sprzedaż.</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-600"><th className="py-1 pr-2">Towar</th><th className="py-1 pr-2">Stan [t]</th><th className="py-1 pr-2">Cena [zł/t]</th><th className="py-1 pr-2 text-right">Sprzedaj</th></tr></thead>
            <tbody>
              {rows.map(([id,have])=>{
                const price = priceFor(date, id);
                return (
                  <tr key={id} className="border-t">
                    <td className="py-1 pr-2">{CROP_LABELS[id] || id}</td>
                    <td className="py-1 pr-2">{(+have).toFixed(2)}</td>
                    <td className="py-1 pr-2">{price.toLocaleString("pl-PL")} zł/t</td>
                    <td className="py-1 pr-2 text-right">
                      <input
                        type="number" min="0" step="0.01"
                        value={qty[id] ?? ""}
                        onChange={(e)=>setQty(q=>({...q,[id]:e.target.value}))}
                        className="w-24 rounded-lg border px-2 py-1 mr-2"
                        placeholder="t"
                      />
                      <button
                        onClick={()=>{
                          const val = parseFloat(qty[id]);
                          if (!isNaN(val) && val>0) onSell(id, val);
                        }}
                        className="rounded-lg px-2 py-1 border hover:bg-gray-50"
                      >Sprzedaj</button>
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
