import { getRunner, Runner } from '../uq-api/db';
import { sleep, checkToDateInt, checkNumberNaNToZero } from '../gfuncs';
import { DefaultUnit } from '../const';

export async function updateAllEarning() {
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

  try {
    await runner.query('clearcapitalearningall', DefaultUnit, undefined, []);
  }
  catch (err) {

  }
  let rCount = 0;
  let sum = 0;
  for (let i = 0; i < count; ++i) {
    await calculateOne(ret[i], runner);
  }
  console.log('updateAllEarning completed')
}

function checkNull(v:any) {
  return v===null || v=== undefined;
}

async function calculateOne(code: any, runner: Runner) {
  try {
    let { id } = code;
    let pret = await runner.mapQuery('新浪财务指标', DefaultUnit, undefined, [id, undefined, 12]);
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
      await runner.mapSave('capitalearning', DefaultUnit, undefined, [id, year, capital, e]);
    }
  }
  catch (err) {
    console.log(err);
  }
}
