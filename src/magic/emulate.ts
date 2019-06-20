import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkNumberNaNToZero } from '../gfuncs';
import { DefaultUnit } from '../const';

const GroupSize = 200;
const MaxGroup = 20;

export async function emulateAtDay(date: number) {
  let runner: Runner = await getRunner('mi');
  let em = new EmulateMagic(runner);
  try {
    console.log('emulate begin day: ' + date);
    let year = Math.floor(date / 10000);
    let month = date % 10000;
    let day = month % 100;
    month = Math.floor(month / 100);
    let p = { year: year, month: month, day: 1, date: date };
    await em.proceeOneDay(p);
    console.log('emulate end day: ' + date);
  }
  catch (err) {
    console.log(err);
  }
}

export async function emulateAll() {
  let runner: Runner = await getRunner('mi');
  let em = new EmulateMagic(runner);
  try {
    for (let year = 2011; year < 2019; ++year) {
      for (let month = 1; month < 13; ++month) {
        let date = year * 10000 + month * 100 + 1;
        if (date > 20180601)
          break;
        let p = { year: year, month: month, day: 4, date: date };
        await em.proceeOneDay(p);
        console.log('emulate end day: ' + date);
      }
    }
  }
  catch (err) {
    console.log(err);
  }
}

export async function allStocksAvg(begin: number, end: number) {
  let runner: Runner = await getRunner('mi');

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

  let rCount = 0;
  let sum = 0;
  let dayBegin = begin > 0 ? begin : 20110101;
  let dayEnd = end > 0 ? end : 20190101;
  for (let i = 0; i < count; ++i) {
    let code = ret[i];
    let { id } = code;
    let pret = await runner.query('getStockRestorePrice', DefaultUnit, undefined, [id, dayBegin, dayEnd]);
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
    await runner.mapSave('股市平均涨幅', DefaultUnit, undefined, 
        [dayBegin, dayEnd, sum, rCount]);
  }
}

class EmulateMagic {
  private runner: Runner;

  constructor(runner: Runner) {
    this.runner = runner;
  }

  async proceeOneDay(p: any): Promise<any> {
    try {
      let { year, month, day, date } = p as { year: number, month: number, day: number, date: number }
      let lastyear = Math.floor(date / 10000) - 1;
      let rowroe: any[] = [lastyear, 1];
      await this.runner.query('calcRoeOrder', DefaultUnit, undefined, rowroe);
      let rowpe: any[] = [date];
      await this.runner.query('calcPeOrder', DefaultUnit, undefined, rowpe);

      let ret = await this.runner.query('getmagicorderresult', DefaultUnit, undefined, []);
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
    let { year, month, day, date } = p as { year: number, month: number, day: number, date: number }
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
      let pret = await this.runner.query('getStockRestorePrice', DefaultUnit, undefined, [stock, dayBegin, dayEnd]);
      let parr = pret as any[];
      let r = parr[0];
      if (r !== undefined) {
        let { priceBegin, priceEx, bonus } = r as { priceBegin: number, priceEx: number, bonus: number };
        priceEx = priceEx + bonus;
        if (priceBegin > 0 && priceEx > 0) {
          ++rCount;
          sum += (priceEx / priceBegin - 1) * 100;
        }
      }
    }

    if (rCount > 0 && rCount >= GroupSize / 2) {
      sum /= rCount;
      await this.runner.mapSave('神奇公式模拟结果', DefaultUnit, undefined,
        [groupIndex, year, month, day, sum, rCount]);
    }
  }
}