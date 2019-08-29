"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
async function updateAllDividend() {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    let runner = await db_1.getRunner(const_1.Const_dbname);
    console.log('updateAllDividend start');
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
    let count = ret.length;
    try {
        await runner.call('tv_dividend$clearall', []);
    }
    catch (err) {
    }
    let rCount = 0;
    let sum = 0;
    for (let i = 0; i < count; ++i) {
        await calculateOne(ret[i], runner);
    }
    console.log('updateAllDividend completed');
    gfuncs_1.RemoteRun(false);
}
exports.updateAllDividend = updateAllDividend;
function checkNull(v) {
    return v === null || v === undefined;
}
async function calculateOne(code, runner) {
    try {
        let { id, symbol } = code;
        let pret = await runner.query('tv_股票分红$query', [id, -1]);
        let parr = pret;
        if (parr.length <= 0)
            return;
        let ce = {};
        let years = [];
        let i = 0;
        for (i = 0; i < parr.length; ++i) {
            let item = parr[i];
            let { 日期, bonus } = item;
            if (bonus <= 0)
                return;
            let year = Math.floor(日期 / 10000);
            let priceret = await runner.query('tv_getstocklastprice', [id, 日期]);
            if (priceret.length <= 0)
                continue;
            let { price } = priceret[0];
            if (price <= 0)
                continue;
            let ys = year.toString();
            let lastd = ce[ys];
            if (lastd !== undefined) {
                ce[ys] = lastd + bonus / price;
            }
            else {
                ce[ys] = bonus / price;
                years.push(ys);
            }
        }
        for (i = 0; i < years[i]; ++i) {
            let ys = years[i];
            let divident = ce[ys];
            await runner.call('tv_dividend$save', [id, ys, divident]);
        }
        //console.log('updateDividend id: ' + id + ' , ' + symbol);
    }
    catch (err) {
        console.log(err);
    }
}
//# sourceMappingURL=updatedividend.js.map