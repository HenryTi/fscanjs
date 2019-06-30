import { updateAllDividend } from "./magic/updatedividend";
import { scanSinaExRight } from "./scan/cqsina";
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

let d = new Date(1999,1,1);
let ms = 24*60*60*1000;
let d1 = new Date(d.getTime() + ms);
let d2 = new Date(d.getTime() - ms);

scanSinaExRight();