export const CROP_LABELS={trawa:"Trawa",pszenica:"Pszenica",zyto:"Żyto",jeczmien:"Jęczmień",kukurydza:"Kukurydza",rzepak:"Rzepak",ziemniaki:"Ziemniaki",burak:"Burak cukrowy",ugor:"Ugor"};
export const CROP_META={trawa:{growable:false,growthDays:0,yieldPerHa:0},ugor:{growable:false,growthDays:0,yieldPerHa:0},
pszenica:{growable:true,growthDays:120,yieldPerHa:2.5},zyto:{growable:true,growthDays:125,yieldPerHa:2.0},
jeczmien:{growable:true,growthDays:90,yieldPerHa:2.3},kukurydza:{growable:true,growthDays:110,yieldPerHa:3.0},
rzepak:{growable:true,growthDays:140,yieldPerHa:1.0},ziemniaki:{growable:true,growthDays:80,yieldPerHa:10.0},
burak:{growable:true,growthDays:160,yieldPerHa:30.0}};
export function availableCropsForDate(d){const y=d.getFullYear();const base=["trawa","pszenica","zyto","jeczmien","ziemniaki","burak","ugor"]; if(y>=1960)base.push("kukurydza"); if(y>=1970)base.push("rzepak"); return base;}
