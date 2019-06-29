import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { Const_dbname } from '../const';
import { EmulateTrade, EmulateResult, EmulateShare, EmulateStockResultItem } from './emulate';

const GroupSize = 30;
const EmulatePlanName = '一直持股';

export async function emulateTrade() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  try {
    let runner: Runner = await getRunner(Const_dbname);
    let em = new EmulateTrades(runner);



  }
  catch (err) {
    console.log(err);
  }
  RemoteRun(false);
}

class EmulateTrades {
  private runner: Runner;

  constructor(runner: Runner) {
    this.runner = runner;
  }

  private async GetEmulateTypeID(dayBegin: number, dayEnd: number): Promise<any> {
    let qr = await this.runner.query('tv_getemulateTypeID', [EmulatePlanName, dayBegin, dayEnd]);
    let arr = qr as any[];
    if (arr.length >= 0) {
      return arr[0];
    }

    qr = await this.runner.call('tv_emulateType$save', [undefined, EmulatePlanName, dayBegin, dayEnd]);
    arr = qr as any[];
    if (arr.length <= 0) {
      return undefined;
    }
    let id = arr[0].id as number;
    if (id === undefined || id <= 0)
      return undefined;
    let ret = { id: id, name: EmulatePlanName, begin: dayBegin, end: dayEnd };
    return ret;
  }

  async proceeOne(p: any): Promise<any> {
    try {
      let { dateBegin, dateEnd } = p as { yearBegin: number, monthBegin: number, dateBegin: number, yearEnd: number, monthEnd: number, dateEnd: number }
      let type = await this.GetEmulateTypeID(dateBegin, dateEnd);
      if (type === undefined)
        throw 'cant get emulatetypeid :' + p;
      let { id } = type as { id: number };
      await this.runner.call('tv_emulatetype$deletedata', [id]);
      await this.CalculateOneDay(id, p);
    }
    catch (err) {
      console.log(err);
    }
  }

  protected async CalculateOneDay(id: number, p: any) {
    let { dateBegin, dateEnd } = p as { yearBegin: number, monthBegin: number, dateBegin: number, yearEnd: number, monthEnd: number, dateEnd: number }
    await this.runner.call('tv_calcemulateyzcg', [dateBegin]);
    let ret = await this.runner.query('tv_getyzcgorderresult', [50]);
    let arr = ret as any[];

    let shares: EmulateStockResultItem[] = [];
    let i = 0;
    for (; i < 30 && i < arr.length; ++i) {
      let item = arr[i];
      let { stock } = item as { stock: number };
      let r = await this.GetOneStockResult(stock, dateBegin, dateEnd);
      if (r !== undefined) {
        shares.push(r);
      }
    }

    let count = shares.length;
    if (count <= 0)
      return;
    let amountAll = 3000000;
    let amountOne = amountAll / count;
    let emuTrades: EmulateTrade[] = [];
    let emuShares: EmulateShare[] = [];
    let emuResult: EmulateResult = {
      type:id, day:dateEnd, money:0, share:0,gain:0
    };
    for (i = 0; i < count; ++i) {
      let item = shares[i];
    }
  }

  protected async GetOneStockResult(stock: number, dayBegin: number, dayEnd: number) : Promise<EmulateStockResultItem> {
    let ret = await this.runner.query('tv_getStockRestoreShare', [stock, dayBegin, dayEnd]);
    if (ret.length <= 0)
      return undefined;
    let { priceBegin, bday, priceEnd, eday, rate, bonus } = ret[0] as { priceBegin: number, bday: number, priceEnd: number, eday: number, rate: number, bonus: number };
    return {
      stock: stock,
      priceBegin: priceBegin,
      dayBegin: bday,
      priceEnd: priceEnd,
      dayEnd: eday,
      rate: rate,
      bonus: bonus
    };
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
