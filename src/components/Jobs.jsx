
import React from "react";

export default function Jobs({ jobs, dailyMH, onUp, onDown, onCancel }){
  return (
    <section className="bg-white rounded-3xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Zlecenia pracy</h3>
      <div className="text-sm text-gray-600 mb-2">Dostępne dziennie: {dailyMH.toFixed(1)} mh</div>
      {(jobs||[]).length===0 ? <p className="text-sm text-gray-600">Brak zleceń.</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-600"><th className="py-1 pr-2">Pole</th><th className="py-1 pr-2">Typ</th><th className="py-1 pr-2">Postęp</th><th className="py-1 pr-2">Status</th><th className="py-1 pr-2 text-right">Akcje</th></tr></thead>
            <tbody>
              {jobs.map(j=>{
                const pct = Math.min(100, Math.round(100 * (j.mhDone||0) / (j.mhRequired||1)));
                return (
                  <tr key={j.id} className="border-t">
                    <td className="py-1 pr-2">{j.plotName}</td>
                    <td className="py-1 pr-2">{j.type}</td>
                    <td className="py-1 pr-2">{pct}% ({(j.mhDone||0).toFixed(1)} / {j.mhRequired.toFixed(1)} mh)</td>
                    <td className="py-1 pr-2">{j.status}</td>
                    <td className="py-1 pr-2 text-right">
                      <button onClick={()=>onUp(j.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 mr-1">↑</button>
                      <button onClick={()=>onDown(j.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 mr-1">↓</button>
                      {j.status==="active" && <button onClick={()=>onCancel(j.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 text-red-700">✕</button>}
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
