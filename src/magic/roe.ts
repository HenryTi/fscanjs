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

    console.log('calculateAllRoe get stocks id');
    try {
      await runner.call('tv_roe$clearall', []);
      console.log('calculateAllRoe clearroe');
    }
    catch (err) {
      console.log(err);
    }

    let count = ret.length;

    for (let i = 0; i < count; ++i) {
      await calculateOne(ret[i], runner);
    }
    console.log('calculateAllRoe completed');
  }
  catch (err) { }
  RemoteRun(false);
}

async function calculateOne(code: any, runner: Runner) {
  try {
    let { id } = code;
    let pret = await runner.query('tv_getcapitalearning', [id]);
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
              await runner.call('tv_roe$save', [id, year, roeavg, roeavg * capital]);
            }
          }
          rowarr.push(lastRoe);
        }
      }
    }
  }
  catch (err) {
    console.log(err);
  }
}
