export const M2_PER_HA = 10000;
export function fmtHa(vM2){ return (vM2 / M2_PER_HA).toFixed(4).replace(/\.0+$/, ""); }
export function formatDatePL(d){ return d.toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "2-digit" }); }
export function seasonOf(date){ const m=date.getMonth(); if([11,0,1].includes(m))return"Zima"; if([2,3,4].includes(m))return"Wiosna"; if([5,6,7].includes(m))return"Lato"; return"Jesień"; }
export function parseNumLocale(s){ if(s==null)return NaN; const cleaned=String(s).trim().replace(/\s+/g,"").replace(",",".");
  return cleaned===""?NaN:Number(cleaned); }
export function validateArea(input,{unit,minM2,maxM2}){
  const n=parseNumLocale(input); if(!isFinite(n))return{ok:false,error:"Podaj liczbę."}; if(n<=0)return{ok:false,error:"Podaj dodatnią wartość."};
  const m2=Math.round(unit==="ha"?n*M2_PER_HA:n); if(m2<minM2)return{ok:false,error:`Minimalna powierzchnia to ${(minM2/M2_PER_HA).toFixed(2)} ha (${minM2} m²).`};
  if(m2>maxM2)return{ok:false,error:`Za mało wolnej ziemi. Dostępne: ${(maxM2/M2_PER_HA).toFixed(4)} ha.`}; return{ok:true,m2}; }
