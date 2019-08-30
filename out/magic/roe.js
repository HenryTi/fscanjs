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
    gfuncs_1.RemoteRun(false);
}
exports.calculateAllRoe = calculateAllRoe;
async function calculateOne(code, runner, lastYear) {
    try {
        let { id } = code;
        let pret = await runner.query('tv_capitalearning$query', [id]);
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
        let roerows = [];
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
            let item = roerows[roerows.length - 1];
            let year = item[1];
            if (year >= lastYear - 1) {
                await runner.call('l_roe$save', item);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}
async function getEarningLastYear(runner) {
    try {
        let maxyear = await runner.sql('select max(`year`) as year from tv_capitalearning;', []);
        if (maxyear === undefined || maxyear.length < 1)
            return 0;
        let lastyear = maxyear[0].year;
        return lastyear;
    }
    catch (err) {
        return 0;
    }
}
//# sourceMappingURL=roe.js.map