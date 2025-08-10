
import React from "react";

export default function Finance({ ledger }){
  const total = (ledger||[]).reduce((a,x)=>a+(x.amount||0),0);
  return (
    <section className="bg-white rounded-3xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Finanse</h3>
      <div className="text-sm text-gray-600 mb-2">Saldo z zapisu: {total.toLocaleString("pl-PL")} zł</div>
      {(ledger||[]).length===0 ? <p className="text-sm text-gray-600">Brak wpisów.</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-600"><th className="py-1 pr-2">Data</th><th className="py-1 pr-2">Opis</th><th className="py-1 pr-2 text-right">Kwota</th></tr></thead>
            <tbody>
              {ledger.map((e,idx)=> (
                <tr key={idx} className="border-t">
                  <td className="py-1 pr-2">{new Date(e.dateISO).toLocaleDateString("pl-PL")}</td>
                  <td className="py-1 pr-2">{e.desc}</td>
                  <td className="py-1 pr-2 text-right">{(e.amount||0).toLocaleString("pl-PL")} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
