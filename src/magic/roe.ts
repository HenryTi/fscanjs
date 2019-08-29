import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { Const_dbname } from '../const';

export async function calculateAllRoe() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  console.log('calculateAllRoe start');
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

    console.log('calculateAllRoe get stocks id');
    let lastyear = await getEarningLastYear(runner);
    try {
      await runner.call('tv_roe$clearall', []);
      await runner.sql('delete from l_roe where 1=1;', []);
    }
    catch (err) {
      console.log(err);
    }

    let count = ret.length;

    for (let i = 0; i < count; ++i) {
      await calculateOne(ret[i], runner, lastyear);
    }

    console.log('calculateAllRoe completed');
  }
  catch (err) { }
  RemoteRun(false);
}

async function calculateOne(code: any, runner: Runner, lastYear:number) {
  try {
    let { id } = code;
    let pret = await runner.query('tv_capitalearning$query', [id]);
    let parr = pret as any[];
    if (parr.length <= 0)
      return;
    let ce = {};
    parr.forEach((item: any) => {
      let { year, capital, earning } = item as { year: number, capital: number, earning: number };
      if (capital <= 0)
        return;
      let roe = earning / capital;
      if (roe > 2)
        return;
      ce[year] = { roe: roe };
    });

    let count = parr.length;
    let roerows = [];
    for (let i = 0; i < count; ++i) {
      let item = parr[i];
      let { year, capital } = item as { year: number, capital: number, earning: number };
      let roe = ce[year];
      if (roe !== undefined) {
        let sum = roe.roe as number;
        let preyear = year;
        let weight = 1;
        let sw = 1;
        let lastRoe = sum;
        let rowarr = [];
        rowarr.push(lastRoe);
        for (let k = 2; k <= 5; ++k) {
          --preyear;
          let ri = ce[preyear];
          if (ri === undefined)
            break;
          sw -= 0.2;
          lastRoe = ri.roe as number;
          sum += lastRoe * sw;
          weight += sw;
          let roeavg = sum / weight;
          if (roeavg > 0 && k == 5) {
            let m = Math.max(...rowarr);
            if (m < roeavg * 3) {
              let oneRoe = [id, year, roeavg, roeavg * capital];
              await runner.call('tv_roe$save', [id, year, roeavg, roeavg * capital]);
              roerows.push(oneRoe);
            }
          }
          rowarr.push(lastRoe);
        }
      }
    }

    if (roerows.length > 0) {
      let item = roerows[roerows.length-1];
      let year = item[1] as number;
      if (year >= lastYear - 1) {
        await runner.call('l_roe$save', [id, item[2], item[3]]);
      }
    }
  }
  catch (err) {
    console.log(err);
  }
}

async function getEarningLastYear(runner: Runner):Promise<number> {
  try {
    let maxyear:any[] = await runner.sql('select max(`year`) as year from tv_capitalearning;', []) as [];
    if (maxyear === undefined || maxyear.length < 1)
      return 0;
    let lastyear = maxyear[0].year;
    return lastyear;
  }
  catch (err) {
    return 0;
  }
}
