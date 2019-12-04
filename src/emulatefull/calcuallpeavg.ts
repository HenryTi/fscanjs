import * as _ from 'lodash';
import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun, LogWithTime } from '../gfuncs';
import { Const_dbname } from '../const';

export async function CalculateAllPeAvg() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);

  LogWithTime('CalculateAllPeAvg begin');
  try {
    let runner: Runner = await getRunner(Const_dbname);
    for (let year = 2001; year <= 2019; ++year) {
      for (let month = 1; month <= 12; ++month) {
        let p = year * 10000 + month * 100 + 1;
        let ret = await runner.call('tv_calcmagicorderdpr', [p, 100]);
        let arr = ret as any[];
        let sum10 = 0;
        let sum50 = 0;
        let sum100 = 0;
        for (let i = 0; i < arr.length; i++) {
          let pe = arr[i].pe;
          sum100 += pe;
          if (i < 10) {
            sum10 += pe;
          }
          if (i < 50) {
            sum50 += pe;
          }
        }
        sum10 /= 10;
        sum50 /= 50;
        sum100 /= 100;
        await runner.call('t_topstockpeavg$save', [year, month, 1, sum10, sum50, sum100]);
      }
    }

  }
  catch (err) {
    console.log(err);
  }
  LogWithTime('CalculateAllPeAvg end');
  RemoteRun(false);
}
