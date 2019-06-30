import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero } from '../gfuncs';
import { Const_dbname } from '../const';

export async function updateAllEarning() {
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
    await runner.query('tv_capitalearning$clear', []);
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
