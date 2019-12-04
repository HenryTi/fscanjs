import { updateAllDividend, updateAllBonusPerYear } from "./magic/updatedividend";
import { scanSinaExRight } from "./scan/cqsina";
import { caclulateExRight } from "./scan/calcexright";
import { calculateAllRoe } from "./magic/roe";
import { fetchSinaContent } from "./scan/sina";
import * as cheerio from 'cheerio';
import { scanSinaFiles } from "./scan/sinafiles";
import * as z from 'zlib';
import { startTimer } from "./timedtask";
import { getRunner, Runner} from "./db";
import { Const_dbname } from "./const";
import { scanSinaFinance, SinaFinace } from "./scan/financesina";
import { updateAllEarning, updateAllLastEarning, updateAllCheckEarningPerYear } from "./magic/updateEarnig";
import { emulateAll } from "./magic/emulatemagic";
import * as TradDay from "./emulate/tradeday";
import { emulateTrade61 } from "./emulate/emulate";
import { CalculateAllPeAvg } from "./emulatefull/calcuallpeavg";
import { emulateTradeFull } from "./emulatefull/emulate";

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

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


async function calculateLastOne(code: any, runner: Runner) {
  try {
    let { id } = code;
    let dt = new Date();
    let year = dt.getFullYear();
    let day = year * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
    let dayBegin = year * 10000 + 101;
    let ret = await runner.query('tv_股票分红$query', [id, dayBegin, day]) as any[];
    let bonus = 0;
    if (ret === undefined || ret.length < 1) {
      year = year - 1;
      dayBegin = year * 10000 + 101;
      day = year * 10000 + 1231;
      ret = await runner.query('t_exrightinfo$query', [id, dayBegin, day]) as any[];
      if (!(ret === undefined || ret.length < 1)) {
        for (let i = 0; i < ret.length; ++i) {
          let item = ret[i] as { stock:number, day:number, bonus:number, factor:number, factore:number };
          if (item.bonus > 0) {
            bonus += item.bonus;
          }
          bonus = bonus * item.factore;
        }
      }
    }
    else {
      ret = await runner.query('t_exrightinfo$query', [id, dayBegin, day]) as any[];
      if (!(ret === undefined || ret.length < 1)) {
        for (let i = 0; i < ret.length; ++i) {
          let item = ret[i] as { stock:number, day:number, bonus:number, factor:number, factore:number };
          if (item.bonus > 0) {
            let bi = item.bonus;
            if (i > 0) {
              for (let j = i -1; j >= 0; --j) {
                let di = ret[j] as { factore:number };
                bi = bi / di.factore;
              }
            }
            bonus += bi;
          }
        }
      }
    }
    if (bonus >  0) {
      await runner.call('t_最近年分红$save', [id, year, bonus]);
    }
  }
  catch (err) {
    console.log(err);
  }
}

interface TestAtr {
  [id: number]: string;
}

async function testa() {
  let runner = await getRunner(Const_dbname);
  //await emulateTrade61(2010, 1, 2019, 1);
  //await emulateTradeFull(2010, 1, 2019, 1);
  let a: any = {};
  a[1] = 'jflsa;';
  a[0] = 'jriewqj;rj1';
  a[5] = '87319483';
  delete a[1];
  a[2] = 'rqjre;jq';
  a['re'] = '4324';
  a.bfd = 'rewqjr';
  a[0] = undefined;

  let b =0;
  debugger
}

testa();