import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { Const_dbname } from '../const';

export async function updateAllDividend() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  
  let runner: Runner = await getRunner(Const_dbname);
  let dt = new Date();
  console.log('updateAllDividend begin  - ' + dt.toLocaleString());

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
    await runner.sql('delete from t_最近年分红 where 1=1;', []);
  }
  catch (err) {

  }
  let rCount = 0;
  let sum = 0;
  for (let i = 0; i < count; ++i) {
    await calculateOne(ret[i], runner);
    await calculateLastOne(ret[i], runner);
  }

  dt = new Date();
  console.log('updateAllDividend end  - ' + dt.toLocaleString());
  RemoteRun(false);
}

function checkNull(v:any) {
  return v===null || v=== undefined;
}

async function calculateOne(code: any, runner: Runner) {
  try {
    let { id, symbol } = code;
    let pret = await runner.query('tv_股票分红$queryall', [id]);
    let parr = pret as any[];
    if (parr.length <= 0)
      return;
    let ce = {};
    let years = [];
    let i:number = 0;
    for (i = 0; i < parr.length; ++i) {
      let item: any = parr[i];
      let { day, bonus } = item as { day: number, bonus: number };
      if (bonus <= 0)
        return;
      let year:number = Math.floor(day/10000);
      let priceret = await runner.query('tv_getstocklastprice', [id, day]);
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
  }
  catch (err) {
    console.log(err);
  }
}

async function calculateLastOne(code: any, runner: Runner) {
  try {
    let { id } = code;
    let dt = new Date();
    let year = dt.getFullYear();
    let day = year * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
    let dayBegin = year * 10000 + 101;
    let ret = await runner.query('tv_股票分红$query', [id, dayBegin, day]) as any[];
    let bonus = 0;
    if (ret === undefined || ret.length < 1) {
      year = year - 1;
      dayBegin = year * 10000 + 101;
      day = year * 10000 + 1231;
      ret = await runner.query('t_exrightinfo$query', [id, dayBegin, day]) as any[];
      if (!(ret === undefined || ret.length < 1)) {
        for (let i = 0; i < ret.length; ++i) {
          let item = ret[i] as { stock:number, day:number, bonus:number, factor:number, factore:number };
          if (item.bonus > 0) {
            bonus += item.bonus;
          }
          bonus = bonus * item.factore;
        }
      }
    }
    else {
      ret = await runner.query('t_exrightinfo$query', [id, dayBegin, day]) as any[];
      if (!(ret === undefined || ret.length < 1)) {
        for (let i = 0; i < ret.length; ++i) {
          let item = ret[i] as { stock:number, day:number, bonus:number, factor:number, factore:number };
          if (item.bonus > 0) {
            let bi = item.bonus;
            if (i > 0) {
              for (let j = i -1; j >= 0; --j) {
                let di = ret[j] as { factore:number };
                bi = bi / di.factore;
              }
            }
            bonus += bi;
          }
        }
      }
    }
    if (bonus >  0) {
      await runner.call('t_最近年分红$save', [id, year, bonus]);
    }
  }
  catch (err) {
    console.log(err);
  }
}
