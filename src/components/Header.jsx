import React from "react";
function Stat({ label, value }){return (<div className="flex flex-col"><span className="text-xs text-gray-500">{label}</span><span className="text-base font-semibold">{value}</span></div>);}
function Badge({ children }){return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">{children}</span>;}
export default function Header({ version, dateLabel, season, daysPlayed, money, onNextTurn, onReset }){
  return (<header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3"><span className="text-xl font-bold">Rolnik TYCOON</span><Badge>{version}</Badge></div>
      <div className="flex items-center gap-4">
        <Stat label="Data" value={dateLabel} /><Stat label="Sezon" value={season} /><Stat label="Dni gry" value={daysPlayed} /><Stat label="Pieniądze" value={<span>{money.toLocaleString("pl-PL")} zł</span>} />
        <button onClick={onNextTurn} className="rounded-2xl px-4 py-2 bg-emerald-600 text-white font-semibold shadow hover:shadow-md active:scale-[.99] transition">Kolejna tura (+1 dzień)</button>
        <button onClick={onReset} className="rounded-2xl px-3 py-2 border text-red-700 hover:bg-red-50">Reset gry</button>
      </div></div></header>);
}
