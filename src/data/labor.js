export const LABOR={persons:2,hoursPerPerson:8,toolMultiplier:1.0};
export const NORMS={prep:25,sow:6,harvest:{pszenica:40,zyto:38,jeczmien:35,kukurydza:35,rzepak:38,ziemniaki:25,burak:30}};
export function mhPerDay(){return LABOR.persons*LABOR.hoursPerPerson*LABOR.toolMultiplier;}
export function mhRequiredFor(jobType,cropId,areaHa){ if(jobType==="prep")return NORMS.prep*areaHa; if(jobType==="sow")return NORMS.sow*areaHa; if(jobType==="harvest"){const base=NORMS.harvest[cropId]??35; return base*areaHa;} return 0;}
