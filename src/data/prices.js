const BASE={pszenica:800,zyto:700,jeczmien:750,kukurydza:850,rzepak:1500,ziemniaki:300,burak:120};
function fracSin(seed){const x=Math.sin(seed)*10000;return x-Math.floor(x);}
function seasonalMultiplier(month){if([6,7,8].includes(month))return 0.92; if([11,0,1].includes(month))return 1.05; return 1.00;}
export function priceFor(date,cropId){if(!BASE[cropId])return 0; const d=date; const seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(); const noise=(fracSin(seed*12.9898)-0.5)*0.18; const season=seasonalMultiplier(d.getMonth()); const base=BASE[cropId]; const price=base*season*(1+noise); return Math.max(1,Math.round(price));}
