import { updateAllDividend } from "./magic/updatedividend";
import { scanSinaExRight } from "./scan/cqsina";
import { caclulateExRight } from "./scan/calcexright";
import { calculateAllRoe } from "./magic/roe";
import { emulateTrade } from "./magic/emulateyzcg";
import { emulateTradeMonthChange } from "./magic/emulatemonthchange";
import { fetchSinaContent } from "./scan/sina";
import * as cheerio from 'cheerio';
import { scanSinaFiles } from "./scan/sinafiles";
import * as z from 'zlib';
import { startTimer } from "./timedtask";

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
startTimer();

async function testZip() {
  let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_CashFlow/stockid/'
    + '600000' + '/ctrl/' + '2018' +'/displaytype/4.phtml';
  let cont = await fetchSinaContent(urlone);
  let row:any[][] = [];
  let $ = cheerio.load(cont);
  $('#ProfitStatementNewTable0').find('>tbody').first().find('>tr')
    .map((index: number, element: CheerioElement) => {
  let subarr:any[] = [];
  $(element).find('>td').map((index: number, element: CheerioElement) => {
  subarr.push($(element).text().trim());
  });
  row.push(subarr);
  });

  let contentStr = JSON.stringify(row);
  let contentLen = contentStr.length;
  let buf = z.gzipSync(contentStr);
  let bufstr = buf.toString('base64');
  let bufstrLen = bufstr.length;
  let bufJson = buf.toJSON();
  
  let b = Buffer.from(bufstr, 'base64');
  let bunzip = z.gunzipSync(b);
  let unzipstr = bunzip.toString();
}


testZip();

async function scansina() {
  await scanSinaFiles(0, true, 'finance');
  await scanSinaFiles(0, true, 'balancesheet');
  await scanSinaFiles(0, true, 'profitstatement');
  await scanSinaFiles(0, true, 'stockstructure');
}
//scansina();

//caclulateExRight();
//emulateTradeMonthChange();
