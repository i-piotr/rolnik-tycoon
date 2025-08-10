
import React from "react";
import { CROP_LABELS } from "../data/crops.js";
import { BARN_CAPACITY_T } from "../data/storage.js";

export default function Barn({ inventory }){
  const items = Object.entries(inventory || {}).filter(([_,q])=>q>0);
  const total = items.reduce((a,[_,q])=>a+q,0);
  const free = Math.max(0, BARN_CAPACITY_T - total);
  return (
    <section className="bg-white rounded-3xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Stodoła (magazyn)</h3>
      <div className="text-sm text-gray-600 mb-2">Pojemność: {BARN_CAPACITY_T.toFixed(1)} t • Zajęte: {total.toFixed(2)} t • Wolne: {free.toFixed(2)} t</div>
      {items.length===0 ? <p className="text-sm text-gray-600">Pusto.</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-600"><th className="py-1 pr-2">Towar</th><th className="py-1 pr-2">Ilość [t]</th></tr></thead>
            <tbody>
              {items.map(([id,qty])=> (
                <tr key={id} className="border-t">
                  <td className="py-1 pr-2">{CROP_LABELS[id] || id}</td>
                  <td className="py-1 pr-2">{(+qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
