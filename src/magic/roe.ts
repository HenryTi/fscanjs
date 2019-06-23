import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { DefaultUnit } from '../const';

export async function calculateAllRoe() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  try {
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

    try {
      await runner.query('clearroeall', DefaultUnit, undefined, []);
    }
    catch (err) {
    }

    let count = ret.length;

    let rCount = 0;
    let sum = 0;
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
    let pret = await runner.query('getcapitalearning', DefaultUnit, undefined, [id]);
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
      let { year } = item as { year: number, capital: number, earning: number };
      let roe = ce[year];
      if (roe !== undefined) {
        let sum = roe.roe as number;
        await runner.mapSave('roe', DefaultUnit, undefined, [id, year, 1, sum]);
        let preyear = year;
        let weight = 1;
        let sw = 1;
        let lastRoe = sum;
        let lastYearRoe = sum;
        let rowarr = [];
        rowarr.push(lastRoe);
        for (let k = 2; k <= 5; ++k) {
          --preyear;
          let ri = ce[preyear];
          if (ri === undefined)
            break;
          sw -= 0.125;
          lastRoe = ri.roe as number;
          sum += lastRoe * sw;
          weight += sw;
          let roeavg = sum / weight;
          rowarr.push(lastRoe);
          if (lastYearRoe > 0) {
            let mx = Math.max(...rowarr);
            let mn = Math.min(...rowarr);
            if (mn > 0) { // && mx < lastYearRoe * 4 && mx < mn * 6) {
              await runner.mapSave('roe', DefaultUnit, undefined, [id, year, k, roeavg]);
            }
          }
        }
      }
    }
  }
  catch (err) {
    console.log(err);
  }
}
