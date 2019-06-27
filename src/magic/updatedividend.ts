import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkNumberNaNToZero } from '../gfuncs';
import { DefaultUnit } from '../const';

export async function updateAllDividend() {
  let runner: Runner = await getRunner('mi');
  console.log('updateAllDividend start')

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

  try {
    await runner.query('cleardividendall', DefaultUnit, undefined, []);
  }
  catch (err) {

  }
  let rCount = 0;
  let sum = 0;
  for (let i = 0; i < count; ++i) {
    await calculateOne(ret[i], runner);
  }
  console.log('updateAllDividend completed')
}

function checkNull(v:any) {
  return v===null || v=== undefined;
}

async function calculateOne(code: any, runner: Runner) {
  try {
    let { id, symbol } = code;
    let pret = await runner.mapQuery('股票分红', DefaultUnit, undefined, [id, undefined]);
    let parr = pret as any[];
    if (parr.length <= 0)
      return;
    let ce = {};
    let years = [];
    let i:number = 0;
    for (i = 0; i < parr.length; ++i) {
      let item: any = parr[i];
      let { 日期, bonus } = item as { 日期: number, bonus: number };
      if (bonus <= 0)
        return;
      let year:number = Math.floor(日期/10000);
      let priceret = await runner.query('getstocklastprice', DefaultUnit, undefined, [id, 日期]);
      if (priceret.length <= 0)
        continue;
      let { price } = priceret[0] as { price:number};
      if (price <= 0)
        continue;
      let ys: string = year.toString();
      let lastd = ce[ys];
      if (lastd !== undefined) {
        ce[ys] = lastd + bonus / price;
      }
      else {
        ce[ys] = bonus / price;
        years.push(ys);
      }
    }
    for (i = 0; i < years[i]; ++i) {
      let ys = years[i];
      let divident = ce[ys];
      await runner.mapSave('dividend', DefaultUnit, undefined, [id, ys, divident]); 
    }
    console.log('updateDividend id: ' + id + ' , ' + symbol);
  }
  catch (err) {
    console.log(err);
  }
}
