import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { Const_dbname } from '../const';

export async function updateAllDividend() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  
  let runner: Runner = await getRunner(Const_dbname);
  console.log('updateAllDividend start')

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

  try {
    await runner.call('tv_dividend$clearall', []);
  }
  catch (err) {

  }
  let rCount = 0;
  let sum = 0;
  for (let i = 0; i < count; ++i) {
    await calculateOne(ret[i], runner);
  }
  console.log('updateAllDividend completed')
  RemoteRun(false);
}

function checkNull(v:any) {
  return v===null || v=== undefined;
}

async function calculateOne(code: any, runner: Runner) {
  try {
    let { id, symbol } = code;
    let pret = await runner.query('tv_股票分红$query', [id, -1]);
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
      let priceret = await runner.query('tv_getstocklastprice', [id, 日期]);
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
      await runner.call('tv_dividend$save', [id, ys, divident]); 
    }
    //console.log('updateDividend id: ' + id + ' , ' + symbol);
  }
  catch (err) {
    console.log(err);
  }
}
