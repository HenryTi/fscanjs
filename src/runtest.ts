import { updateAllDividend } from "./magic/updatedividend";
var timespan = require('timespan');
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

let d = new Date(1999,1,1);
let tsd = timespan.fromDays(1);
let ms = tsd.totalMilliseconds();
let d1 = new Date(d.getTime() + ms);
let d2 = new Date(d.getTime() - ms);


debugger;
updateAllDividend();

