import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, RemoteIsRun, RemoteRun } from '../gfuncs';
import { fetchSinaContent } from './sina';
import { Const_dbname } from '../const';

export async function scanSinaHistory(len: number, start: number) {
  if (RemoteIsRun())
    return;
  RemoteRun(true);

  try {
    let runner = await getRunner(Const_dbname);
    let sqg = new SinaHistory(runner);

    let ret: any[] = [];
    let pageStart = start, pageSize = 500;
    for (; ;) {
      let ids = await runner.query('tv_股票$search', ['', pageStart, pageSize]);
      let arr = ids as any[];
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
    console.log('stock count = ' + count);
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
        await sleep(1000);
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
  catch (err) {
    console.log(err);
  }
  RemoteRun(false);
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
      console.log("fetch sina history err " + item);
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
      let date = checkToDateInt(day);
      if (date === undefined)
        continue;
      let row = [id, date, close, open, high, low, volume];
      if (date < 19950101)
        continue;
      promiseArr.push(this.runner.call('tv_股票价格历史$save', row));
      if (promiseArr.length >= 200) {
        await Promise.all(promiseArr);
        promiseArr.splice(0, promiseArr.length);
      }
    }
    if (promiseArr.length > 0) {
      await Promise.all(promiseArr);
    }
  }
}
