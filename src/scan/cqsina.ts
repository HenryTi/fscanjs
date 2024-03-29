import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { fetchSinaContent } from './sina';
import { Const_dbname } from '../const';
import * as cheerio from 'cheerio';

export async function scanSinaExRight() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  console.log(`scanSinaExRight Begin`);

  let runner = await getRunner(Const_dbname);
  let sinaer = new SinaExRight(runner);
  try {
    let ret: any[] = [];
    let pageStart = 0, pageSize = 100;
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
  console.log('scanSinaExRight End');
  RemoteRun(false);
}

class SinaExRight {
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
    let url = 'https://money.finance.sina.com.cn/corp/go.php/vISSUE_ShareBonus/stockid/' + code + '.phtml';
    let content = await fetchSinaContent(url);
    let promiseArr: Promise<any>[] = [];
    let rows: any[][] = [];
    let $ = cheerio.load(content);
    $('#sharebonus_1>tbody>tr').map((index: number, element: CheerioElement) => {
      let value: any[] = [];
      $(element).find('>td').map((i: number, e: CheerioElement) => {
        value.push($(e).text());
      });
      if (value.length == 9 && value[4] === '实施') {
        let day = checkToDateInt(value[5]);
        if (isNaN(day))
          return;
        let row: any[] = [id,
          day,
          checkNumberNaNToZero(value[1]),
          checkNumberNaNToZero(value[2]),
          checkNumberNaNToZero(value[3]),
          0, 0];
        rows.push(row);
      }
    });

    $('#sharebonus_2>tbody>tr').map((index: number, element: CheerioElement) => {
      let value: any[] = [];
      $(element).find('>td').map((i: number, e: CheerioElement) => {
        value.push($(e).text());
      });
      if (value.length == 11) {
        let day = checkToDateInt(value[4]);
        if (isNaN(day))
          return;
        let pei = checkNumberNaNToZero(value[1]);
        let peiPrice = checkNumberNaNToZero(value[2]);
        if (pei <= 0 || peiPrice <= 0)
          return;
        for (let i = 0; i < rows.length; ++i) {
          let item = rows[i];
          if (item[1] === day) {
            item[5] = pei;
            item[6] = peiPrice;
            return;
          }
        }
        let row: any[] = [id, day, 0, 0, 0, pei, peiPrice];
        rows.push(row);
      }
    });
    rows.forEach((item: any[]) => {
      promiseArr.push(this.runner.call('tv_新浪除权信息$save', item));
    });
    if (promiseArr.length > 0)
      await Promise.all(promiseArr);
    await this.runner.call('tv_计算除权因子', [id]);
    await this.runner.call('c_calculateexrightinfo', [id]);
  }
}