import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkNumberNaNToZero } from '../gfuncs';
import { DefaultUnit } from '../const';

const GroupSize = 30;

export async function emulateAtDay(day:number) {
  let runner:Runner = await getRunner('mi');
  let em = new EmulateMagic(runner);
  try {
    console.log('emulate begin day: ' + day);
    await em.proceeOneDay(day);
    console.log('emulate end day: ' + day);
  }
  catch (err) {
    console.log(err);
  }
}

export async function emulateAll() {
  let runner:Runner = await getRunner('mi');
  let em = new EmulateMagic(runner);
  try {
    for (let year = 2015; year < 2018; ++year) {
      for (let month = 1; month < 13; ++month) {
        let day = year * 10000 + month * 100 + 1;
        console.log('emulate begin day: ' + day);
        await em.proceeOneDay(day);
        console.log('emulate end day: ' + day);
      }
    }
  }
  catch (err) {
    console.log(err);
  }
}

class EmulateMagic {
  private runner: Runner;

  constructor(runner: Runner) {
    this.runner = runner;
  }

  async proceeOneDay(day:number):Promise<any> {
    try {
      let lastyear = Math.floor(day / 10000) - 1;
      let rowroe:any[] = [lastyear];
      await this.runner.query('calcRoeOrder',DefaultUnit, undefined, rowroe);
      let rowpe:any[] = [day];
      await this.runner.query('calcPeOrder', DefaultUnit, undefined, rowpe);

      let ret = await this.runner.query('getmagicorderresult', DefaultUnit, undefined, []);
      let arr = ret as any[];

      let dayEnd = day + 10000;
      for (let i = 0; i < 33; ++i) {
        await this.CalculateOneGroup(day, dayEnd, arr, i);
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  protected async CalculateOneGroup(dayBegin:number, dayEnd:number, codes:any[], groupIndex:number) {
    let count = codes.length;
    let i = groupIndex * GroupSize;
    let end = i + GroupSize;
    if (end > count)
      return;
    
    let rCount = 0;
    let sum = 0;
    for(; i < end; ++i) {
      let code = codes[i];
      let { stock } = code;
      let pret = await this.runner.query('getStockRestorePrice', DefaultUnit, undefined, [stock, dayBegin, dayEnd]);
      let parr = pret as any[];
      let r = parr[0];
      if (r !== undefined) {
        let {priceBegin, priceEx, bonus} = r as {priceBegin:number , priceEx:number, bonus:number};
        priceEx = priceEx + bonus;
        if (priceBegin > 0 && priceEx > 0) {
          ++rCount;
          sum += (priceEx / priceBegin - 1) * 100;
        }
      }
    }

    if (rCount > 0 && rCount >= GroupSize / 2) {
      sum /= rCount;
      await this.runner.mapSave('神奇公式模拟结果', DefaultUnit, undefined, [groupIndex, dayBegin, sum, rCount]);
      console.log('save magicgroup ' + groupIndex);
    }
  }
}