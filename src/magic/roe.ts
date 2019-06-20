import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkNumberNaNToZero } from '../gfuncs';
import { DefaultUnit } from '../const';

export async function calculateAllRoe() {
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
  let count = ret.length;

  let rCount = 0;
  let sum = 0;
  for (let i = 0; i < count; ++i) {
    await calculateOne(ret[i], runner);
  }
  console.log('calculateAllRoe completed')
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
      let roe = capital > 0 ? earning / capital : 0;
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
        let sum = roe.roe;
        await runner.mapSave('roe', DefaultUnit, undefined, [id, year, 1, sum]);
        let preyear = year;
        let weight = 1;
        let sw = 1;
        for (let k = 2; k <= 5; ++k) {
          --preyear;
          let ri = ce[preyear];
          if (ri === undefined)
            break;
          sw -= 0.125;
          sum += ri.roe * sw;
          weight += sw;
          let roeavg = sum / weight;
          await runner.mapSave('roe', DefaultUnit, undefined, [id, year, k, roeavg]);
        }
      }
    }
  }
  catch (err) {
    console.log(err);
  }
}
