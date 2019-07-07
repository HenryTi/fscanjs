"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
async function calculateAllRoe() {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    console.log('calculateAllRoe start');
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let ret = [];
        let pageStart = 0, pageSize = 500;
        for (;;) {
            let ids = await runner.query('tv_股票$search', ['', pageStart, pageSize]);
            let arr = ids;
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
    gfuncs_1.RemoteRun(false);
}
exports.calculateAllRoe = calculateAllRoe;
async function calculateOne(code, runner) {
    try {
        let { id } = code;
        let pret = await runner.query('tv_getcapitalearning', [id]);
        let parr = pret;
        if (parr.length <= 0)
            return;
        let ce = {};
        parr.forEach((item) => {
            let { year, capital, earning } = item;
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
            let { year, capital } = item;
            let roe = ce[year];
            if (roe !== undefined) {
                let sum = roe.roe;
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
                    lastRoe = ri.roe;
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
//# sourceMappingURL=roe.js.map