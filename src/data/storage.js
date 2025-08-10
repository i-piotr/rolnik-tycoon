export const BARN_CAPACITY_T=50;
export const DAILY_LOSS={pszenica:0.0001,zyto:0.0001,jeczmien:0.0001,kukurydza:0.0002,rzepak:0.00015,ziemniaki:0.0008,burak:0.0010};
export function applyDailySpoilage(inventory){let totalLoss=0; const out={...inventory}; for(const [id,qty] of Object.entries(inventory)){const rate=DAILY_LOSS[id]??0; if(rate<=0||qty<=0)continue; const loss=+(qty*rate).toFixed(4); out[id]=Math.max(0,+(qty-loss).toFixed(4)); totalLoss+=loss;} return {inventory:out, loss:+totalLoss.toFixed(4)};}
