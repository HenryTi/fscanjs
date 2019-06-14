import { getRunner, Runner } from './uq-api/db';
import { sleep } from './sleep';
import { fetchSinaContent } from './sina';
import { DefaultUnit } from './const';

export async function scanSinaHistory(len: number) {
  let runner = await getRunner('mi');
  let sqg = new SinaHistory(runner);

  let ret: any[] = [];
  let pageStart = 24, pageSize = 500;
  for (; ;) {
    let ids = await runner.tuidSeach('股票', DefaultUnit, undefined, undefined, '', pageStart, pageSize);
    let arr = ids[0];
    if (arr.length > pageSize) {
      let top = arr.pop();
      ret.push(...arr);
      pageStart = arr[pageSize - 1].id;
    }
    else {
      ret.push(...arr);
      break;
    }
  }
  let count = ret.length;
  let i: number, j: number;
  let retryArr = [];
  i = 0;
  for (; ;) {
    if (i >= count) {
      break;
    }
    let code = ret[i];
    ++i;

    let r = await sqg.processOne(code, len);
    if (!r) {
      retryArr.push(code);
    }
    else {
      console.log('sinahistory: ' + code['id'] + ' : ' + code['symbol']);
    }
  }

  count = retryArr.length;
  for (i = 0; i < count; ++i) {
    let rc = retryArr[i];
    for (j = 0; j < 10; ++j) {
      await sleep(3000);
      let r = await sqg.processOne(rc, len);
      if (r) {
        console.log('sinahistory retry: ' + rc['id'] + ' : ' + rc['symbol']);
        break;
      }
    }
  }
}

class SinaHistory {
  private runner: Runner;
  constructor(runner: Runner) {
    this.runner = runner;
  }

  async processOne(item: any, len: number): Promise<boolean> {
    try {
      let { id, symbol } = item as { id: number, symbol: string };
      let url = 'https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?scale=240&ma=5&symbol='
        + symbol + '&datalen=' + len;

      let results = await this.fetchString(url);
      if (results === null || results === undefined) {
        results = await this.fetchString(url);
      }
      if (results === null || results === undefined) {
        results = await this.fetchString(url);
      }

      await this.saveHistory(id, results);
    }
    catch (err) {
      return false;
    }
    return true;
  }

  protected async fetchString(url: string): Promise<string> {
    try {
      let ret = await fetchSinaContent(url);
      return ret;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  protected async saveHistory(id: number, values: string) {
    let lines = eval(values);
    let promiseArr: Promise<void>[] = [];
    let i: number;
    let count = lines.length;
    for (i = 0; i < count; ++i) {
      let item = lines[i];
      let { day, open, high, low, close, volume } = item;
      let date = this.checkToDateInt(day);
      if (date === undefined)
        continue;
      let row = [id, date, close, open, high, low, volume];
      promiseArr.push(this.runner.mapSave('股票价格历史', DefaultUnit, undefined, row));
      // if (promiseArr.length >= 150) {
      //   await Promise.all(promiseArr);
      //   promiseArr.splice(0, promiseArr.length);
      // }
    }
    if (promiseArr.length > 0) {
      await Promise.all(promiseArr);
    }
  }

  protected checkToDateInt(str: string) {
    let s = str.split('-').join('');
    let ret = parseInt(s);
    if (isNaN(ret))
      return undefined;
    return ret;
  }
}
