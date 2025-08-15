import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Toolbar from "./components/Toolbar.jsx";
import Modal from "./components/Modal.jsx";
import PlotList from "./components/PlotList.jsx";
import BuildingList from "./components/BuildingList.jsx";
import Barn from "./components/Barn.jsx";
import Market from "./components/Market.jsx";
import Finance from "./components/Finance.jsx";
import Jobs from "./components/Jobs.jsx";
import TopBar from "./components/TopBar.jsx"; // ← DODANE
import { NumberField, SelectField } from "./components/Forms.jsx";
import { fmtHa, formatDatePL, seasonOf, validateArea, M2_PER_HA } from "./utils/format.js";
import { loadSave, saveGame, clearSave } from "./utils/storage.js";
import { CROP_META } from "./data/crops.js";
import { START_DATE, END_DATE_EXCLUSIVE, TOTAL_FARM_M2, SETTLEMENT_M2, OPEN_FIELD_AREA_M2, MIN_PLOT_M2, START_MONEY } from "./game/constants.js";
import { nextName, sortPlots } from "./game/helpers.js";
import { priceFor } from "./data/prices.js";
import { WINDOWS, inWindow, SOW_OUT_PENALTY, HARVEST_OUT_PENALTY } from "./data/windows.js";
import { BARN_CAPACITY_T, applyDailySpoilage } from "./data/storage.js";
import { LABOR, mhPerDay, mhRequiredFor } from "./data/labor.js";
import Toast from './Toast';

import { APP_VERSION } from "./version";
// Auto-wersja z package.json (ustawiana w vite.config.js)
const APP_VER = `v${APP_VERSION}`;

export default function App(){
  
  // [GRAZYNKA:TOAST:BEGIN]
  const [toastItem, setToastItem] = useState(null);

// Ustaw global gToast po zamontowaniu komponentu (stabilne także w HMR)
useEffect(() => {
  window.gToast = (opts) => setToastItem({ type: 'info', duration: 3000, ...opts });
  return () => { try { delete window.gToast; } catch {} };
}, []);
  // [GRAZYNKA:TOAST:END]
const restored = loadSave();
  const [date,setDate] = useState(restored? new Date(restored.dateISO): START_DATE);
  const [message,setMessage] = useState(null);
  const [plots,setPlots] = useState(()=>{
    const fromSave = restored?.plots ?? [];
    const hasSettlement = fromSave.some(p=>p.fixed);
    if (hasSettlement) return fromSave;
    return [...fromSave,{ id:"fixed_siedlisko", name:"Siedlisko", areaM2: SETTLEMENT_M2, type:"build", fixed:true }];
  });
  const [money,setMoney] = useState(restored?.money ?? START_MONEY);
  const [inventory,setInventory] = useState(restored?.inventory ?? {});
  const [ledger,setLedger] = useState(restored?.ledger ?? []);
  const [jobs,setJobs] = useState(restored?.jobs ?? []);

  const [arableSortKey,setArableSortKey] = useState(restored?.ui?.arableSortKey ?? "name");
  const [arableSortDir,setArableSortDir] = useState(restored?.ui?.arableSortDir ?? "asc");
  const [arableQuery,setArableQuery] = useState(restored?.ui?.arableQuery ?? "");
  const [arableCropFilter,setArableCropFilter] = useState(restored?.ui?.arableCropFilter ?? "wszystko");
  const [buildSortKey,setBuildSortKey] = useState(restored?.ui?.buildSortKey ?? "name");
  const [buildSortDir,setBuildSortDir] = useState(restored?.ui?.buildSortDir ?? "asc");
  const [buildQuery,setBuildQuery] = useState(restored?.ui?.buildQuery ?? "");
  

  useEffect(()=>{
    saveGame({ dateISO: date.toISOString(), plots, money, inventory, ledger, jobs, ui:{
      arableSortKey,arableSortDir,arableQuery,arableCropFilter, buildSortKey,buildSortDir,buildQuery
    }});
  }, [date,plots,money,inventory,ledger,jobs,arableSortKey,arableSortDir,arableQuery,arableCropFilter,buildSortKey,buildSortDir,buildQuery]);

  const season = useMemo(()=> seasonOf(date),[date]);
  const daysPlayed = useMemo(()=> Math.floor((date.getTime()-START_DATE.getTime())/(1000*3600*24)),[date]);
  const usedArableM2 = useMemo(()=> plots.filter(p=>p.type==="arable").reduce((a,b)=>a+b.areaM2,0),[plots]);
  const usedBuildM2  = useMemo(()=> plots.filter(p=>p.type==="build").reduce((a,b)=>a+b.areaM2,0),[plots]);
  const freeM2 = useMemo(()=>{
    const dynamicUsed = plots.filter(p=>!p.fixed).reduce((a,b)=>a+b.areaM2,0);
    return Math.max(0, OPEN_FIELD_AREA_M2 - dynamicUsed);
  },[plots]);

  useEffect(()=>{
    const dynamicUsed = plots.filter(p=>!p.fixed).reduce((a,b)=>a+b.areaM2,0);
    console.assert(dynamicUsed <= OPEN_FIELD_AREA_M2 + 1e-6, "[TEST] Nadmiarowy przydział OPEN_FIELD");
  },[plots]);

  function completeJob(j){
    if (j.type === "prep"){
      setPlots(prev=> prev.map(p=> p.id===j.plotId ? { ...p, tilled: true, crop: "ugor", grow: null } : p));
      return;
    }
    if (j.type === "sow"){
      const meta = CROP_META[j.cropId];
      const sowOK = inWindow(date, (WINDOWS[j.cropId]||{}).sow);
      const sowPenalty = sowOK ? 1 : SOW_OUT_PENALTY;
      setPlots(prev=> prev.map(p=> p.id===j.plotId ? {
        ...p,
        crop: j.cropId,
        tilled: false,
        grow: meta && meta.growable ? {
          growable: true,
          growthDaysRequired: meta.growthDays,
          growthDaysElapsed: 0,
          isReady: false,
          yieldPerHa: meta.yieldPerHa,
          sowDateISO: date.toISOString(),
          sowPenalty
        } : null
      } : p));
      return;
    }
    if (j.type === "harvest"){
      setPlots(prev => {
        const p = prev.find(x=>x.id===j.plotId);
        if (!p || p.type !== "arable" || !p.grow || !p.grow.isReady) return prev;
        const areaHa = p.areaM2 / 10000;
        const meta = CROP_META[p.crop] || {};
        const sowMul = p.grow.sowPenalty ?? 1;
        const inHarv = inWindow(date, (WINDOWS[p.crop]||{}).harvest || []);
        const harvMul = inHarv ? 1 : HARVEST_OUT_PENALTY;
        const qty = (meta.yieldPerHa || 0) * areaHa * sowMul * harvMul;

        const used = Object.values(inventory).reduce((a,b)=>a+(b||0),0);
        const freeT = Math.max(0, BARN_CAPACITY_T - used);
        const fit = Math.min(qty, freeT);
        const lost = +(qty - fit).toFixed(4);

        if (fit > 0){
          setInventory(prevInv => ({ ...prevInv, [p.crop]: +(((prevInv[p.crop] || 0) + fit).toFixed(4)) }));
        }
        if (lost > 0){
          setMessage(`Brak miejsca w stodole — utracono ${lost.toFixed(2)} t.`);
        }
        return prev.map(x => x.id===j.plotId ? { ...x, crop: "ugor", grow: null, tilled: false } : x);
      });
      return;
    }
  }

  function processJobsOneDay(){
    let remaining = mhPerDay();
    setJobs(prevJobs => {
      const updated = prevJobs.map(x=>({ ...x }));
      for (let i=0; i<updated.length && remaining>0; i++){
        const j = updated[i];
        if (j.status !== "active") continue;
        const need = Math.max(0, j.mhRequired - j.mhDone);
        if (need <= 0) continue;
        const use = Math.min(need, remaining);
        j.mhDone += use;
        remaining -= use;
        if (j.mhDone + 1e-9 >= j.mhRequired){
          j.status = "done";
          j.completedISO = date.toISOString();
          completeJob(j);
        }
      }
      return updated;
    });
  }

  function nextTurn(){
    if (date >= END_DATE_EXCLUSIVE) return;
    const next = new Date(date); next.setDate(next.getDate()+1);
    if (next >= END_DATE_EXCLUSIVE){ setMessage("Osiągnięto granicę symulacji: 1 stycznia 2000 r."); setDate(END_DATE_EXCLUSIVE); return; }

    processJobsOneDay();

    setPlots(prev => prev.map(p => {
      if (p.type !== "arable" || !p.grow || !p.grow.growable || p.grow.isReady) return p;
      const elapsed = p.grow.growthDaysElapsed + 1;
      const isReady = elapsed >= p.grow.growthDaysRequired;
      return { ...p, grow: { ...p.grow, growthDaysElapsed: elapsed, isReady } };
    }));

    setInventory(prev => {
      const { inventory: inv2, loss } = applyDailySpoilage(prev);
      if (loss > 0.0001){
        setMessage(`Ubytek zapasów w stodole: ${loss.toFixed(2)} t (psucie).`);
      } else {
        setMessage(null);
      }
      return inv2;
    });

    setDate(next);
  }

  const [showForm,setShowForm] = useState(null);
  const [newName,setNewName] = useState("");
  const [newArea,setNewArea] = useState("");
  const [newUnit,setNewUnit] = useState("ha");
  const [formErr,setFormErr] = useState(null);

  const [editId,setEditId] = useState(null);
  const editPlot = plots.find(p=>p.id===editId) || null;
  const [editName,setEditName] = useState("");
  const [editArea,setEditArea] = useState("");
  const [editUnit,setEditUnit] = useState("ha");

  function openForm(type){ setShowForm(type); setNewName(""); setNewArea(""); setNewUnit("ha"); setFormErr(null); }
  function openEdit(p){ setEditId(p.id); setEditName(p.name); setEditUnit("ha"); setEditArea((p.areaM2/M2_PER_HA).toFixed(4)); }

  function addPlot(){
    const auto = nextName(plots, showForm||"arable");
    const name = (newName.trim()||auto).slice(0,60);
    const res = validateArea(newArea ?? "", { unit: newUnit, minM2: MIN_PLOT_M2, maxM2: freeM2 });
    if (!res.ok){ setFormErr(res.error); return; }
    const plot = { id:`p_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name, areaM2: res.m2, type: showForm||"arable", crop: showForm==="arable"?"trawa":undefined, grow: null, tilled: false };
    setPlots(prev=>[...prev, plot]); setShowForm(null);
  }

  function deletePlot(id){ const p = plots.find(x=>x.id===id); if (p?.fixed) return; setPlots(prev=>prev.filter(p=>p.id!==id)); }

  function addJob(job){
    setJobs(prev=> [...prev, { ...job, id: `j_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, status:"active", mhDone: 0 }]);
  }
  function addPrep(plotId){
    const p = plots.find(x=>x.id===plotId);
    if (!p || p.type!=="arable" || p.tilled) return;
    const areaHa = p.areaM2 / 10000;
    const req = mhRequiredFor("prep", null, areaHa);
    addJob({ type:"prep", plotId, plotName: p.name, mhRequired: req });
  }
  function addSow(plotId, cropId){
    const p = plots.find(x=>x.id===plotId);
    if (!p || p.type!=="arable") return;
    const areaHa = p.areaM2 / 10000;
    if (!p.tilled){
      const prepReq = mhRequiredFor("prep", null, areaHa);
      addJob({ type:"prep", plotId, plotName: p.name, mhRequired: prepReq });
    }
    const sowReq = mhRequiredFor("sow", cropId, areaHa);
    addJob({ type:"sow", plotId, plotName: p.name, cropId, mhRequired: sowReq });
  }
  function addHarvest(plotId){
    const p = plots.find(x=>x.id===plotId);
    if (!p || p.type!=="arable" || !p.grow || !p.grow.isReady) return;
    const areaHa = p.areaM2 / 10000;
    const req = mhRequiredFor("harvest", p.crop, areaHa);
    addJob({ type:"harvest", plotId, plotName: p.name, mhRequired: req });
  }
  function jobUp(id){
    setJobs(prev=>{
      const i = prev.findIndex(j=>j.id===id);
      if (i<=0) return prev;
      const copy = prev.slice();
      const tmp = copy[i-1]; copy[i-1] = copy[i]; copy[i] = tmp;
      return copy;
    });
  }
  function jobDown(id){
    setJobs(prev=>{
      const i = prev.findIndex(j=>j.id===id);
      if (i<0 || i===prev.length-1) return prev;
      const copy = prev.slice();
      const tmp = copy[i+1]; copy[i+1] = copy[i]; copy[i] = tmp;
      return copy;
    });
  }
  function jobCancel(id){
    setJobs(prev=> prev.map(j=> j.id===id && j.status==="active" ? { ...j, status:"cancelled" } : j));
  }

  function sell(cropId, qty){
    const have = inventory[cropId] || 0;
    if (!(qty > 0) || qty > have) return;
    const price = priceFor(date, cropId);
    const revenue = Math.round(price * qty);
    setInventory(prev => ({ ...prev, [cropId]: +(have - qty).toFixed(4) }));
    setMoney(m => m + revenue);
    setLedger(L => [...L, { dateISO: date.toISOString(), type:"sale", desc:`Sprzedaż: ${cropId} ${qty.toFixed(2)} t × ${price} zł/t`, amount: revenue }]);
  }

  const [showReset, setShowReset] = useState(false);
  function performReset(){
    clearSave();
    setDate(START_DATE);
    setMoney(START_MONEY);
    setInventory({});
    setLedger([]);
    setJobs([]);
    setPlots([{ id:"fixed_siedlisko", name:"Siedlisko", areaM2: SETTLEMENT_M2, type:"build", fixed:true }]);
    setArableSortKey("name"); setArableSortDir("asc"); setArableQuery(""); setArableCropFilter("wszystko");
    setBuildSortKey("name"); setBuildSortDir("asc"); setBuildQuery("");
    setShowReset(false);
    setMessage("Gra zresetowana do stanu początkowego.");
  }

  const arableList = useMemo(()=>{
    const q = arableQuery.trim().toLowerCase();
    let list = plots.filter(p=>p.type==="arable");
    if (q) list = list.filter(p=> p.name.toLowerCase().includes(q));
    if (arableCropFilter!=="wszystko") list = list.filter(p=> (p.crop ?? "trawa")===arableCropFilter);
    return sortPlots(list, arableSortKey, arableSortDir);
  },[plots, arableQuery, arableSortKey, arableSortDir, arableCropFilter]);

  const buildList = useMemo(()=>{
    const q = buildQuery.trim().toLowerCase();
    let list = plots.filter(p=>p.type==="build");
    if (q) list = list.filter(p=> p.name.toLowerCase().includes(q));
    return sortPlots(list, buildSortKey, buildSortDir);
  },[plots, buildQuery, buildSortKey, buildSortDir]);

  // ——— HUD labels do TopBar ———
  const dayLabel = formatDatePL(date);
  const seasonLabel = season;

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
      {/* Sticky pasek na górze */}
      <TopBar
  money={money}
  dayLabel={dayLabel}
  seasonLabel={seasonLabel}
  onNextTurn={nextTurn}
/>
        {/* [GRAZYNKA:TOAST:BEGIN] */}
        {toastItem && <Toast {...toastItem} onClose={() => setToastItem(null)} />}
        {/* [GRAZYNKA:TOAST:END] */}

       


      {/* Dotychczasowy Header (z przyciskami "Następny dzień" / "Reset") */}
      <Header
        version={APP_VER}
        dateLabel={formatDatePL(date)}
        season={season}
        daysPlayed={daysPlayed}
        money={money}
        onReset={()=>setShowReset(true)}
      />

      <Toolbar
        freeM2={freeM2}
        minPlotM2={MIN_PLOT_M2}
        onAddField={()=>openForm("arable")}
        onAddBuild={()=>openForm("build")}
      />

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 gap-4">
        <section className="bg-white rounded-3xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Gospodarstwo — podsumowanie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
            <div className="flex flex-col"><span className="text-xs text-gray-500">Całkowity obszar</span><span className="text-base font-semibold">{(TOTAL_FARM_M2 / M2_PER_HA).toFixed(2)} ha</span></div>
            <div className="flex flex-col"><span className="text-xs text-gray-500">Siedlisko (stałe)</span><span className="text-base font-semibold">{fmtHa(SETTLEMENT_M2)} ha</span></div>
            <div className="flex flex-col"><span className="text-xs text-gray-500">Teren do podziału</span><span className="text-base font-semibold">{fmtHa(OPEN_FIELD_AREA_M2)} ha</span></div>
            <div className="flex flex-col"><span className="text-xs text-gray-500">Wolna ziemia</span><span className="text-base font-semibold">{fmtHa(freeM2)} ha</span></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col"><span className="text-xs text-gray-500">Pola uprawne</span><span className="text-base font-semibold">{fmtHa(usedArableM2)} ha</span></div>
            <div className="flex flex-col"><span className="text-xs text-gray-500">Pod zabudowę (razem)</span><span className="text-base font-semibold">{fmtHa(usedBuildM2)} ha</span></div>
            <div className="flex flex-col"><span className="text-xs text-gray-500">Zasoby pracy</span><span className="text-base font-semibold">{LABOR.persons*LABOR.hoursPerPerson} mh/dzień</span></div>
            <div className="flex flex-col"><span className="text-xs text-gray-500">Aktywne zlecenia</span><span className="text-base font-semibold">{jobs.filter(j=>j.status==="active").length}</span></div>
          </div>
        </section>

        <Barn inventory={inventory} />

        <Market date={date} inventory={inventory} onSell={sell} />

        <PlotList
          date={date}
          list={arableList}
          arableQuery={arableQuery}
          setArableQuery={setArableQuery}
          arableCropFilter={arableCropFilter}
          setArableCropFilter={setArableCropFilter}
          arableSortKey={arableSortKey}
          setArableSortKey={setArableSortKey}
          arableSortDir={arableSortDir}
          setArableSortDir={setArableSortDir}
          openEdit={openEdit}
          deletePlot={deletePlot}
          openForm={openForm}
          onAddPrep={addPrep}
          onAddSow={addSow}
          onAddHarvest={addHarvest}
        />

        <BuildingList
          list={buildList}
          buildQuery={buildQuery}
          setBuildQuery={setBuildQuery}
          buildSortKey={buildSortKey}
          setBuildSortKey={setBuildSortKey}
          buildSortDir={buildSortDir}
          setBuildSortDir={setBuildSortDir}
          openEdit={openEdit}
          deletePlot={deletePlot}
          openForm={openForm}
        />

        <Jobs
          jobs={jobs}
          dailyMH={mhPerDay()}
          onUp={jobUp}
          onDown={jobDown}
          onCancel={jobCancel}
        />

        <Finance ledger={ledger} />

        {message && <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3 shadow">{message}</div>}
      </main>

      {showForm && (
        <Modal title={showForm === "arable" ? "Dodaj pole uprawne (start: trawa)" : "Dodaj teren pod zabudowę"}
               onClose={()=>setShowForm(null)}
               footer={<>
                 <button onClick={()=>setShowForm(null)} className="rounded-xl px-3 py-1.5 border font-medium hover:bg-gray-50">Anuluj</button>
                 <button onClick={addPlot} className="rounded-xl px-3 py-1.5 bg-emerald-600 text-white font-semibold">Dodaj</button>
               </>}>
          <label className="block text-sm">Nazwa
            <input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder={showForm === "arable" ? "Pole A" : "Zabudowa A"} className="mt-1 w-full rounded-lg border px-3 py-2"/>
          </label>
          <div className="grid grid-cols-3 gap-2 items-end">
            <NumberField label="Wielkość" value={newArea} onChange={setNewArea} placeholder={newUnit==="ha"?"np. 0.15":"np. 1500"} />
            <SelectField label="Jednostka" value={newUnit} onChange={setNewUnit} options={[{value:"ha",label:"ha"},{value:"m2",label:"m²"}]} />
          </div>
          {formErr && <div className="text-sm text-red-700">{formErr}</div>}
          <div className="mt-2 text-xs text-gray-500">Minimalna powierzchnia: {(MIN_PLOT_M2/M2_PER_HA).toFixed(2)} ha ({MIN_PLOT_M2} m²) • Dostępne: {fmtHa(freeM2)} ha</div>
        </Modal>
      )}

      {editPlot && (
        <Modal title={`Edytuj: ${editPlot.name}`}
               onClose={()=>setEditId(null)}
               footer={<>
                 <button onClick={()=>setEditId(null)} className="rounded-xl px-3 py-1.5 border font-medium hover:bg-gray-50">Anuluj</button>
                 {!editPlot.fixed && <button onClick={()=>{ deletePlot(editPlot.id); setEditId(null); }} className="rounded-xl px-3 py-1.5 border font-medium hover:bg-gray-50 text-red-700">Usuń</button>}
                 <button onClick={()=>setEditId(null)} className="rounded-xl px-3 py-1.5 bg-emerald-600 text-white font-semibold">Zamknij</button>
               </>}>
          <label className="block text-sm">Nazwa
            <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"/>
          </label>
          <div className="grid grid-cols-3 gap-2 items-end">
            <NumberField label="Powierzchnia" value={editArea} onChange={setEditArea} />
            <SelectField label="Jednostka" value={editUnit} onChange={setEditUnit} options={[{value:"ha",label:"ha"},{value:"m2",label:"m²"}]} />
          </div>
          <div className="mt-2 text-xs text-gray-500">Minimalna powierzchnia: {(MIN_PLOT_M2/M2_PER_HA).toFixed(2)} ha ({MIN_PLOT_M2} m²) • Wolna ziemia: {fmtHa(freeM2)} ha</div>
          <div className="text-xs text-gray-600 mt-2">Uwaga: zmianę uprawy wykonuj zleceniem „Siew” w tabeli pól.</div>
        </Modal>
      )}

      <footer className="max-w-6xl mx-auto px-4 pb-6 text-xs text-gray-500"><div className="mt-6">© 1946–2000 (fikcyjna oś gry) • Prototyp interfejsu — Grażynka</div></footer>
    </div>
  );
}
