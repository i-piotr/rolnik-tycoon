import React from "react";

const TERMINAL = new Set(["done","completed","cancelled","canceled","failed","expired"]);
const norm = (s) => String(s ?? "").toLowerCase().trim();
const num  = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export default function Jobs({ jobs = [], dailyMH = 0, onUp, onDown, onCancel }) {
  // Pokazuj tylko zlecenia nieukończone (<100%) i nie w statusie końcowym
  const visibleJobs = (jobs || []).filter((j) => {
    const req = num(j.mhRequired);
    const done = num(j.mhDone);
    const st   = norm(j.status);
    if (TERMINAL.has(st)) return false;
    if (done + 1e-6 >= req) return false; // 100% lub ponad -> ukryj
    return true;
  });

  return (
    <section className="bg-white rounded-3xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Zlecenia pracy</h3>
      <div className="text-sm text-gray-600 mb-2">Dostępne dziennie: {Number(dailyMH||0).toFixed(1)} mh</div>

      {visibleJobs.length === 0 ? (
        <p className="text-sm text-gray-600">Brak aktywnych zleceń.</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-1 pr-2">Pole</th>
                <th className="py-1 pr-2">Typ</th>
                <th className="py-1 pr-2">Postęp</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {visibleJobs.map((j) => {
                const req = Math.max(1e-9, num(j.mhRequired));
                const done = num(j.mhDone);
                const pct  = Math.min(100, Math.round((100 * done) / req));
                const st   = norm(j.status) || "active";
                return (
                  <tr key={j.id} className="border-t">
                    <td className="py-1 pr-2">{j.plotName}</td>
                    <td className="py-1 pr-2">{j.type}</td>
                    <td className="py-1 pr-2">{pct}% ({done.toFixed(1)} / {req.toFixed(1)} mh)</td>
                    <td className="py-1 pr-2">{st}</td>
                    <td className="py-1 pr-2 text-right">
                      <div className="inline-flex">
                        <button onClick={()=>onUp && onUp(j.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 mr-1" title="Priorytet wyżej">↑</button>
                        <button onClick={()=>onDown && onDown(j.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 mr-1" title="Priorytet niżej">↓</button>
                        {!TERMINAL.has(st) && (
                          <button onClick={()=>onCancel && onCancel(j.id)} className="rounded-lg px-2 py-1 border hover:bg-gray-50 text-red-700" title="Anuluj">✕</button>
                        )}
                      </div>
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