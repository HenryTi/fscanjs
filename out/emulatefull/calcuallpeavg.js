"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
async function CalculateAllPeAvg() {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    gfuncs_1.LogWithTime('CalculateAllPeAvg begin');
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        for (let year = 2001; year <= 2019; ++year) {
            for (let month = 1; month <= 12; ++month) {
                let p = year * 10000 + month * 100 + 1;
                let ret = await runner.call('tv_calcmagicorderdpr', [p, 100]);
                let arr = ret;
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
    gfuncs_1.LogWithTime('CalculateAllPeAvg end');
    gfuncs_1.RemoteRun(false);
}
exports.CalculateAllPeAvg = CalculateAllPeAvg;
//# sourceMappingURL=calcuallpeavg.js.map