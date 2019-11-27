import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { Const_dbname } from '../const';

const GroupSize = 30;
const MaxGroup = 20;

export async function emulateAtDay(date: number) {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  try {
    let runner: Runner = await getRunner(Const_dbname);
    let em = new EmulateMagic(runner);
    console.log('emulate begin day: ' + date);
    let year = Math.floor(date / 10000);
    let month = date % 10000;
    month = Math.floor(month / 100);
    date = year * 10000 + month * 100 + 1;
    let p = { year: year, month: month, day: 1, date: date };
    await runner.call('tv_神奇公式模拟结果$delete', [year, month]);
    await runner.call('tv_神奇公式模拟结果明细$delete', [-1, date]);
    await em.proceeOneDay(p);
    console.log('emulate end day: ' + date);
  }
  catch (err) {
    console.log(err);
  }
  RemoteRun(false);
}

export async function emulateAll() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  try {
    let runner: Runner = await getRunner(Const_dbname);
    let em = new EmulateMagic(runner);
    await runner.call('tv_神奇公式模拟结果$delete', [-1, -1]);
    await runner.call('tv_神奇公式模拟结果明细$delete', [-1, -1]);

    for (let year = 2001; year < 2019; ++year) {
      for (let month = 1; month < 12; month += 3) {
        let date = year * 10000 + month * 100 + 1;
        if (date > 20180601)
          break;
        let p = { year: year, month: month, day: 1, date: date };
        await em.proceeOneDay(p);
        console.log('emulate end :  ' + date);
      }
    }
  }
  catch (err) {
    console.log(err);
  }
  RemoteRun(false);
}

export async function allStocksAvg(begin: number, end: number) {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  try {
    let runner: Runner = await getRunner(Const_dbname);

    let ret: any[] = [];
    let pageStart = 0, pageSize = 500;
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

    let rCount = 0;
    let sum = 0;
    let dayBegin = begin > 0 ? begin : 20110101;
    let dayEnd = end > 0 ? end : 20190101;
    for (let i = 0; i < count; ++i) {
      let code = ret[i];
      let { id } = code;
      let pret = await runner.call('tv_getStockRestorePrice', [id, dayBegin, dayEnd]);
      let parr = pret as any[];
      let r = parr[0];
      if (r !== undefined) {
        let { priceBegin, priceEx, bonus, bday } = r as { priceBegin: number, priceEx: number, bonus: number, bday: number, eday: number };
        if (bday - dayBegin < 300) {
          priceEx = priceEx + bonus;
          if (priceBegin > 0 && priceEx > 0) {
            ++rCount;
            let one = (priceEx / priceBegin - 1) * 100;
            sum += one;
          }
        }
      }
    }

    if (rCount > 0) {
      sum = sum / rCount;
      console.log('股数: ' + rCount + '  平均涨幅：' + sum + ' dayBegin=' + dayBegin + ' dayEnd=' + dayEnd);
      await runner.call('tv_股市平均涨幅$save',
        [dayBegin, dayEnd, sum, rCount]);
    }
  }
  catch (err) { }
  RemoteRun(false);
}

class EmulateMagic {
  private runner: Runner;

  constructor(runner: Runner) {
    this.runner = runner;
  }

  async proceeOneDay(p: any): Promise<any> {
    try {
      let { year, month, date } = p as { year: number, month: number, date: number }
      let rowroe: any[] = [date, 800];
      let ret = await this.runner.call('tv_calcmagicorderdpr', rowroe);

      //let ret = await this.runner.query('tv_getmagicorderresult', [2000]);
      let arr = ret as any[];

      let dayEnd = date + 10000;
      for (let i = 0; i < MaxGroup; ++i) {
        await this.CalculateOneGroup(date, dayEnd, arr, i, p);
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  protected async CalculateOneGroup(dayBegin: number, dayEnd: number, codes: any[], groupIndex: number, p: any) {
    let { year, month, yearlen, date } = p as { year: number, month: number, yearlen: number, date: number }
    let count = codes.length;
    let i = groupIndex * GroupSize;
    let end = i + GroupSize;
    if (end > count)
      return;

    let rCount = 0;
    let sum = 0;
    for (; i < end; ++i) {
      let code = codes[i];
      let { stock } = code;
      let pret = await this.runner.query('tv_getStockRestorePrice', [stock, dayBegin, dayEnd]);
      let parr = pret as any[];
      let r = parr[0];
      if (r !== undefined) {
        let { priceBegin, priceEx, bonus } = r as { priceBegin: number, priceEx: number, bonus: number };
        priceEx = priceEx + bonus;
        if (priceBegin > 0 && priceEx > 0) {
          ++rCount;
          let zf = (priceEx / priceBegin - 1) * 100;
          sum += zf;
          await this.runner.call('tv_神奇公式模拟结果明细$save', [groupIndex, date, stock, zf]);
        }
      }
    }

    if (rCount > 0 && rCount >= GroupSize / 2) {
      sum /= rCount;
      await this.runner.call('tv_神奇公式模拟结果$save',
        [groupIndex, year, month, sum, rCount]);
    }
  }
}
