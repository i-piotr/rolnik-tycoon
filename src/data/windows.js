export const WINDOWS={pszenica:{sow:[2,3],harvest:[6,7]},zyto:{sow:[2,3],harvest:[7,8]},jeczmien:{sow:[2,3],harvest:[6,7]},
kukurydza:{sow:[3,4],harvest:[8,9]},rzepak:{sow:[3,4],harvest:[7,8]},ziemniaki:{sow:[3,4],harvest:[8,9]},burak:{sow:[3,4],harvest:[8,9]}};
export const SOW_OUT_PENALTY=0.7; export const HARVEST_OUT_PENALTY=0.8;
export function inWindow(date,months){ if(!months||months.length===0) return true; return months.includes(date.getMonth()); }
