import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { Const_dbname } from '../const';

export async function updateAllEarning() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  console.log(`updateAllEarning Begin`);

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

  try {
    await runner.sql(
`delete from tv_capitalearning where 1=1;
delete from l_earning where 1=1;
delete from l_earningchecked where 1=1;`,
       []);
  }
  catch (err) {
    
  }
  let rCount = 0;
  let sum = 0;
  for (let i = 0; i < count; ++i) {
    await calculateOne(ret[i], runner);
  }
  
  await calculateLastEarning(ret, runner);

  console.log('updateAllEarning End')
  RemoteRun(false);
}

export async function updateAllLastEarning() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  console.log(`updateAllLastEarning Begin`);

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

  try {
    await runner.sql(
`delete from l_earning where 1=1;
delete from l_earningchecked where 1=1;`,
       []);
  }
  catch (err) {
    
  }
  
  await calculateLastEarning(ret, runner);

  console.log('updateAllLastEarning End')
  RemoteRun(false);
}

function checkNull(v:any) {
  return v===null || v=== undefined;
}

async function calculateOne(code: any, runner: Runner) {
  try {
    let { id } = code;
    let pret = await runner.query('tv_新浪财务指标$query', [id, undefined, 12]);
    let parr = pret as any[];
    for (let i = 0; i < parr.length;  ++i) {
      let item = parr[i];
      let year = item.year;
      let capital = item.每股净资产_调整前;
      if (checkNull(capital)) {
        capital = item.每股净资产_调整后;
        if (checkNull(capital))
          continue;
      }
      let earning = item.摊薄每股收益;
      if (checkNull(earning)) {
        earning = item.扣非每股收益;
        if (checkNull(earning)) {
          earning = item.每股收益_调整后;
          if (checkNull(earning)) {
            earning = item.加权每股收益;
            if (checkNull(earning))
              continue;
          }
        }
      }

      let e = Number(earning);
      if (e >= 1000)
        continue;
      await runner.call('tv_capitalearning$save', [id, year, capital, e]);
    }
  }
  catch (err) {
    console.log(err);
  }
}

async function calculateLastEarning(codes:any[], runner: Runner) {
  try {
    let maxyear:any[] = await runner.sql('select max(`year`) as year from tv_capitalearning;', []) as [];
    if (maxyear === undefined || maxyear.length < 1)
      return;
    let lastyear = maxyear[0].year;

    let count = codes.length;
    for (let i = 0; i < count; ++i) {
      await calculateOneEarning(codes[i], runner, lastyear);
    }
  }
  catch (err) {
  }
}

async function calculateOneEarning(code: any, runner: Runner, lastyear:number) {
  try {
    let { id } = code;
    let pret = await runner.query('tv_capitalearning$querylast', [id, lastyear-6]);
    let parr = pret as any[];
    if (parr.length <= 0)
      return;

    let count = parr.length;
    let i = 0;
    let iEnd = count > 5 ? 5 : count;
    let lastItem = parr[0];
    let yearEnd = lastItem.year as number;
    if (yearEnd < lastyear - 1)
      return;
    let sum = 0;
    for (; i < iEnd; ++i) {
      let { year, capital, earning } = parr[i] as { year: number, capital: number, earning: number };
      if (year < yearEnd - i)
        break;
      sum += earning;
      let e = sum / (i + 1);
      await runner.call('l_earning$save', [id, i+1, e, yearEnd]);
    }

    if (count <= 3)
      return;
    iEnd = count > 6 ? 6 : count;
    sum = 0;
    let lastE = lastItem.earning as number;
    for (i = 1; i < iEnd; ++i) {
      let { earning } = parr[i] as { year: number, earning: number };
      sum += earning;
    }
    let eavg = sum / (iEnd - 1);
    if (lastE < eavg * 2) {
      await runner.call('l_earningchecked$save', [id, lastE, yearEnd]);
    }
  }
  catch (err) {
    console.log(err);
  }
}

export async function updateAllCheckEarningPerYear() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  console.log(`updateAllCheckEarningPerYear Begin`);

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

  try {
    await runner.sql(
`delete from t_earningcheckedperyear where 1=1;`,
       []);
  }
  catch (err) {
    
  }
  
  await calculateCheckedEarningPerYear(ret, runner);

  console.log('updateAllCheckEarningPerYear End')
  RemoteRun(false);
}

async function calculateCheckedEarningPerYear(codes:any[], runner: Runner) {
  try {
    let count = codes.length;
    for (let i = 0; i < count; ++i) {
      await calculateOneEarningPeryear(codes[i], runner);
    }
  }
  catch (err) {
  }
}

async function calculateOneEarningPeryear(code: any, runner: Runner) {
  try {
    let { id } = code;
    let pret = await runner.query('tv_capitalearning$query', [id]);
    let parr = pret as any[];
    if (parr.length <= 4)
      return;

    let count = parr.length;
    for (let yi = count - 1; yi > 3; --yi) {
      let lastItem = parr[yi];
      let lastE = lastItem.earning as number;
      if (lastE <= 0)
        continue;
      let yearEnd = lastItem.year as number;
      let i = yi - 5;
      if (i < 0)
        i = 0;
      let nc = yi - i;
      let sum = 0;
      for (; i < yi; ++i) {
        let { year, earning } = parr[i] as { year: number, capital: number, earning: number };
        sum += earning;
      }
      let eavg = sum / nc;
      if (lastE < eavg * 2) {
        await runner.call('t_earningcheckedperyear$save', [id, yearEnd, lastE]);
      }
    }
  }
  catch (err) {
    console.log(err);
  }
}
