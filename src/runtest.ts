import { updateAllDividend } from "./magic/updatedividend";
import { scanSinaExRight } from "./scan/cqsina";
import { caclulateExRight } from "./scan/calcexright";
import { calculateAllRoe } from "./magic/roe";
import { emulateTrade } from "./magic/emulateyzcg";
import { emulateTradeMonthChange } from "./magic/emulatemonthchange";
import { fetchSinaContent } from "./scan/sina";
import * as cheerio from 'cheerio';
import { scanSinaFiles } from "./scan/sinafiles";


console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

let d = new Date(1999,1,1);
let ms = 24*60*60*1000;
let d1 = new Date(d.getTime() + ms);
let d2 = new Date(d.getTime() - ms);
var result = 0.1 * 0.2;

scanSinaFiles(0, 'cashflow');
//caclulateExRight();
//emulateTradeMonthChange();
