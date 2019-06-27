import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { DefaultUnit } from '../const';

const GroupSize = 30;
const EmulatePlanName = '一直持股';

export async function emulateTrade() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  try {
    let runner: Runner = await getRunner('mi');
    let em = new EmulateTrade(runner);



  }
  catch (err) {
    console.log(err);
  }
  RemoteRun(false);
}

class EmulateTrade {
  private runner: Runner;

  constructor(runner: Runner) {
    this.runner = runner;
  }

  private async GetEmulateTypeID(dayBegin: number, dayEnd: number): Promise<any> {
    let qr = await this.runner.query('getemulateTypeID', DefaultUnit, undefined, [EmulatePlanName, dayBegin, dayEnd]);
    let arr = qr as any[];
    if (arr.length >= 0) {
      return arr[0];
    }

    qr = await this.runner.tuidSave('emulateType', DefaultUnit, undefined, [undefined, EmulatePlanName, dayBegin, dayEnd]);
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
      let {id} = type as { id: number };
      await this.runner.query('clearOneEmulateType', DefaultUnit, undefined, [id]);
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
      let pret = await this.runner.query('getStockRestorePrice', DefaultUnit, undefined, [stock, dayBegin, dayEnd]);
      let parr = pret as any[];
      let r = parr[0];
      if (r !== undefined) {
        let { priceBegin, priceEx, bonus } = r as { priceBegin: number, priceEx: number, bonus: number };
        priceEx = priceEx + bonus;
        if (priceBegin > 0 && priceEx > 0) {
          ++rCount;
          let zf = (priceEx / priceBegin - 1) * 100;
          sum += zf;
          await this.runner.mapSave('神奇公式模拟结果明细', DefaultUnit, undefined, [groupIndex, date, stock, zf]);
        }
      }
    }

    if (rCount > 0 && rCount >= GroupSize / 2) {
      sum /= rCount;
      await this.runner.mapSave('神奇公式模拟结果', DefaultUnit, undefined,
        [groupIndex, year, month, sum, rCount]);
    }
  }
}
