import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { fetchSinaContent } from './sina';
import { Const_dbname } from '../const';
import * as cheerio from 'cheerio';

export async function scanSinaFinance(start: number, scanAll: boolean = false) {
  if (RemoteIsRun())
    return;
  RemoteRun(true);

  console.log(`scanSinaFinance Begin`);

  try {
    let runner = await getRunner(Const_dbname);
    let sinaer = new SinaFinace(runner, scanAll);
    let ret: any[] = [];
    let pageStart = start, pageSize = 100;
    for (; ;) {
      let ids = await runner.query('tv_股票$search', ['', pageStart, pageSize]);
      let arr = ids as any[];
      if (arr.length > pageSize) {
        let top = arr.pop();
        pageStart = arr[pageSize - 1].id;
        await sinaer.processGroup(arr);
      }
      else {
        if (arr.length > 0) {
          await sinaer.processGroup(arr);
        }
        break;
      }
    }

    await sinaer.processRetry();
  }
  catch (err) {
    console.log(err);
  }

  console.log(`scanSinaFinance End`);
  RemoteRun(false);
}

function parseToDate(str: string) {
  let r = { year: 0, month: 0, day: 0 };
  let s = str.split('-');
  r.year = parseInt(s[0]);
  r.month = parseInt(s[1]);
  r.day = parseInt(s[2]);
  if (isNaN(r.year) || isNaN(r.month) || isNaN(r.day))
    return undefined;
  return r;
}

function checkparseNumber(s: string) {
  if (s == '--')
    return undefined;
  let ret = Number(s);
  if (isNaN(ret))
    return undefined;
  return ret;
}

export class SinaFinace {
  private runner: Runner;
  private retryArr: any[];
  private scanAll: boolean;

  constructor(runner: Runner, scanAll: boolean) {
    this.runner = runner;
    this.scanAll = scanAll;
    this.retryArr = [];
  }

  async processGroup(items: any[]) {
    if (items.length <= 0)
      return;
    for (let i = 0; i < items.length; ++i) {
      let item = items[i];
      await this.processOne(item);
    }
  }

  async processRetry() {
    for (let index = 0; index < this.retryArr.length; ++index) {
      let item = this.retryArr[index];
      for (let i = 0; i < 5; ++i) {
        let r = await this.retryOne(item);
        if (r)
          break;
        else
          sleep(3000);
      }
    }
  }

  async processOne(item: any) {
    try {
      await this.scanItem(item);
    }
    catch (err) {
      this.retryArr.push(item);
      return false;
    }
    return true;
  }

  protected async retryOne(item: any) {
    try {
      await this.scanItem(item);
    }
    catch (err) {
      return false;
    }
    return true;
  }

  protected async scanItem(item: any) {
    let { id } = item as { id: number };
    let ret = await this.runner.query('t_stockarchives$query', [id, '新浪财务指标', null]) as [];
    if (ret === undefined || ret.length <= 0) {
      return;
    }

    for (let i = 0; i < ret.length; ++i) {
      let item = ret[i];
      await this.scanOneYear(id, item);
    }
  }

  protected async checkDataExist(id: number, year: string) {
    let ret = await this.runner.query('tv_新浪财务指标$query', [id, year, 12]) as [];
    if (ret === undefined || ret.length < 1) {
      return false;
    }
    return true;
  }

  protected async scanOneYear(id: number, item: any) {
    let { name, text } = item as { name: string, text: string };
    let year = name;
    if (!this.scanAll) {
      let fcheck = await this.checkDataExist(id, year);
      if (fcheck) {
        return;
      }
    }

    let values = JSON.parse(text);
    let row = values as any[][];
    if (row.length < 11)
      return;

    let dateArr = row[0];
    for (let k = 1; k < dateArr.length; ++k) {
      let nitem = [id];
      let date = parseToDate(dateArr[k])
      if (date === undefined)
        break;
      nitem.push(date.year);
      nitem.push(date.month);
      let findData = false;
      for (let ni = 2; ni < 11; ++ni) {
        let s = row[ni][k];
        let value = checkparseNumber(s);
        if (value !== undefined)
          findData = true;
        nitem.push(value);
      }
      if (findData) {
        await this.runner.query('tv_新浪财务指标$save', nitem);
      }
    }
  }
}

/* class SinaFinaceFromWeb {
  private runner: Runner;
  private retryArr: any[];

  constructor(runner: Runner) {
    this.runner = runner;
    this.retryArr = [];
  }

  async processGroup(items: any[]) {
    if (items.length <= 0)
      return;
    for (let i = 0; i < items.length; ++i) {
      let item = items[i];
      await this.processOne(item);
    }
  }

  async processRetry() {
    for (let index = 0; index < this.retryArr.length; ++index) {
      let item = this.retryArr[index];
      for (let i = 0; i < 5; ++i) {
        let r = await this.retryOne(item);
        if (r)
          break;
        else
          sleep(3000);
      }
    }
  }

  protected async processOne(item: any) {
    try {
      await this.scanItem(item);
    }
    catch (err) {
      this.retryArr.push(item);
      return false;
    }
    return true;
  }

  protected async retryOne(item: any) {
    try {
      await this.scanItem(item);
    }
    catch (err) {
      return false;
    }
    return true;
  }

  protected async scanItem(item: any) {
    let { id, symbol, code } = item as { id: number, symbol: string, code: string };
    let url = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
      + code + '/displaytype/4.phtml';
    let content = await fetchSinaContent(url);
    let promiseArr: Promise<any>[] = [];
    let years: string[] = [];
    let $ = cheerio.load(content);
    $('#con02-1').find('>table').first().find('>tbody').first().find('>tr').first().find('a')
      .map((index: number, element: CheerioElement) => {
        years.push($(element).text());
      });

    for (let i = 0; i < years.length; ++i) {
      let year = years[i].trim();
      let urlone = 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/'
        + code + '/ctrl/' + year + '/displaytype/4.phtml';
      let cont = await fetchSinaContent(urlone);
      let row: any[][] = [];
      let $ = cheerio.load(cont);
      $('#BalanceSheetNewTable0').find('>tbody').first().find('>tr')
        .map((index: number, element: CheerioElement) => {
          let subarr: any[] = [];
          $(element).find('>td').map((index: number, element: CheerioElement) => {
            subarr.push($(element).text());
          });
          row.push(subarr);
        });
      if (row.length < 11)
        continue;

      let dateArr = row[0];
      for (let k = 1; k < dateArr.length; ++k) {
        let nitem = [id];
        let date = parseToDate(dateArr[k])
        if (date === undefined)
          break;
        nitem.push(date.year);
        nitem.push(date.month);
        let findData = false;
        for (let ni = 2; ni < 11; ++ni) {
          let s = row[ni][k];
          let value = checkparseNumber(s);
          if (value !== undefined)
            findData = true;
          nitem.push(value);
        }
        if (findData) {
          await this.runner.query('tv_新浪财务指标$save', nitem);
        }
      }
    }

    console.log('scan sinaFinance, code: ' + id + ' - ' + symbol);
  }
} */