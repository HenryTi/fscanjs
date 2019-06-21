import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkToDateIntHK, RemoteIsRun, RemoteRun } from '../gfuncs';
import { fetchSinaContent } from './sina';
import { DefaultUnit } from '../const';

export async function scanSinaQuotations() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);

  try {
    let runner = await getRunner('mi');

    let ret: any[] = [];
    let pageStart = 0, pageSize = 500;
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
    let oneGroup = [];
    i = 0;
    let totalCount = 0;
    for (; ;) {
      if (i >= count) {
        break;
      }
      let code = ret[i];
      oneGroup.push(code);
      ++i;

      if (oneGroup.length >= 40 || i >= count) {
        let gv = oneGroup;
        oneGroup = [];
        let sqg = new SinaQuotationGroup(runner);
        let r = await sqg.processOneGroup(gv);
        if (r != 1) {
          retryArr.push(gv);
        }
        else {
          totalCount += gv.length;
          console.log('sinahq: count=' + totalCount);
        }
      }
    }

    count = retryArr.length;
    for (i = 0; i < count; ++i) {
      let gv = retryArr[i];
      for (j = 0; j < 10; ++j) {
        await sleep(3000);
        let sqg = new SinaQuotationGroup(runner);
        let r = await sqg.processOneGroup(gv);
        if (r == 1) {
          totalCount += gv.length;
          console.log('sinahq retry: count=' + totalCount);
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

class SinaQuotationGroup {
  private runner: Runner;
  private idTable: Object;
  constructor(runner: Runner) {
    this.runner = runner;
    this.idTable = {};
  }

  async processOneGroup(items: any[]): Promise<0 | 1> {
    try {
      this.idTable = {};
      let lstr = '';
      items.forEach((value: any, index: number) => {
        let { symbol } = value as { symbol: string };
        lstr += ',' + symbol;
        let idname = symbol;
        this.idTable[idname] = value;
      });
      if (lstr.length <= 1)
        return 1;
      let url = 'https://hq.sinajs.cn/list=' + lstr.substring(1);

      let results = await this.fetchString(url);
      if (results === null || results === undefined) {
        results = await this.fetchString(url);
      }
      if (results === null || results === undefined) {
        results = await this.fetchString(url);
      }

      await this.saveQutations(results);
    }
    catch (err) {
      return 0;
    }
    return 1;
  }

  async fetchString(url: string): Promise<string> {
    try {
      let ret = await fetchSinaContent(url);
      return ret;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async saveQutations(values: string) {
    let lines = values.split('\n');
    let promiseArr: Promise<void>[] = [];
    let i: number;
    let count = lines.length;
    for (i = 0; i < count; ++i) {
      let line = lines[i];
      if (line.length <= 0)
        break;
      let arr = line.split('=');
      let head = arr[0].substring(11);
      let subarr = arr[1].split('"');
      let items = subarr[1].split(',');
      if (items.length < 6)
        continue;
      let idItem = this.idTable[head];
      let row = this.getQuotatonRow(idItem, items);
      if (row === undefined)
        throw 'hqsina 返回格式错误';
      if (row[3] === '0.000')
        continue;
      promiseArr.push(this.runner.mapSave('股票价格', DefaultUnit, undefined, row));
    }
    if (promiseArr.length > 0) {
      await Promise.all(promiseArr);
    }
  }

  protected getQuotatonRow(idItem: any, arr: string[]) {
    let { id, market } = idItem;
    let row: any[] = [id];
    let date: number;
    switch (market) {
      default:
        date = checkToDateInt(arr[30]);
        if (date === undefined)
          return undefined;
        row.push(date);
        row.push(arr[3]);
        row.push(arr[1]);
        row.push(arr[4]);
        row.push(arr[5]);
        break;
      case 'HK':
        date = checkToDateInt(arr[17]);
        if (date === undefined)
          return undefined;
        row.push(date);
        row.push(arr[6]);
        row.push(arr[2]);
        row.push(arr[4]);
        row.push(arr[5]);
        break;
    }

    return row;
  }
}
