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

let date = new Date();
let yn = date.getFullYear();

async function scansina() {
  await scanSinaFiles(0, true, 'finance');
  await scanSinaFiles(0, true, 'balancesheet');
  await scanSinaFiles(0, true, 'profitstatement');
  await scanSinaFiles(0, true, 'stockstructure');
}
scansina();

//caclulateExRight();
//emulateTradeMonthChange();
