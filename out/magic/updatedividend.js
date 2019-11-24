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
    let dt = new Date();
    console.log('updateAllDividend begin  - ' + dt.toLocaleString());
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
        await runner.sql('delete from t_最近年分红 where 1=1;', []);
    }
    catch (err) {
    }
    let rCount = 0;
    let sum = 0;
    for (let i = 0; i < count; ++i) {
        await calculateOne(ret[i], runner);
        await calculateLastOne(ret[i], runner);
    }
    dt = new Date();
    console.log('updateAllDividend end  - ' + dt.toLocaleString());
    gfuncs_1.RemoteRun(false);
}
exports.updateAllDividend = updateAllDividend;
function checkNull(v) {
    return v === null || v === undefined;
}
async function calculateOne(code, runner) {
    try {
        let { id, symbol } = code;
        let pret = await runner.query('tv_股票分红$queryall', [id]);
        let parr = pret;
        if (parr.length <= 0)
            return;
        let ce = {};
        let years = [];
        let i = 0;
        for (i = 0; i < parr.length; ++i) {
            let item = parr[i];
            let { day, bonus } = item;
            if (bonus <= 0)
                continue;
            let year = Math.floor(day / 10000);
            let priceret = await runner.query('tv_getstocklastprice', [id, day]);
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
    }
    catch (err) {
        console.log(err);
    }
}
async function calculateLastOne(code, runner) {
    try {
        let { id } = code;
        let dt = new Date();
        let year = dt.getFullYear();
        let day = year * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
        let dayBegin = year * 10000 + 101;
        let ret = await runner.query('tv_股票分红$query', [id, dayBegin, day]);
        let bonus = 0;
        if (ret === undefined || ret.length < 1) {
            year = year - 1;
            dayBegin = year * 10000 + 101;
            day = year * 10000 + 1231;
            ret = await runner.query('t_exrightinfo$query', [id, dayBegin, day]);
            if (!(ret === undefined || ret.length < 1)) {
                for (let i = 0; i < ret.length; ++i) {
                    let item = ret[i];
                    if (item.bonus > 0) {
                        bonus += item.bonus;
                    }
                    bonus = bonus * item.factore;
                }
            }
        }
        else {
            ret = await runner.query('t_exrightinfo$query', [id, dayBegin, day]);
            if (!(ret === undefined || ret.length < 1)) {
                for (let i = 0; i < ret.length; ++i) {
                    let item = ret[i];
                    if (item.bonus > 0) {
                        let bi = item.bonus;
                        if (i > 0) {
                            for (let j = i - 1; j >= 0; --j) {
                                let di = ret[j];
                                bi = bi / di.factore;
                            }
                        }
                        bonus += bi;
                    }
                }
            }
        }
        if (bonus > 0) {
            await runner.call('t_最近年分红$save', [id, year, bonus]);
        }
    }
    catch (err) {
        console.log(err);
    }
}
async function updateAllBonusPerYear() {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    let runner = await db_1.getRunner(const_1.Const_dbname);
    let dt = new Date();
    console.log('updateAllBonusPerYear begin  - ' + dt.toLocaleString());
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
        await runner.sql('delete from t_bonusperyear where 1=1;', []);
    }
    catch (err) {
    }
    let rCount = 0;
    let sum = 0;
    for (let i = 0; i < count; ++i) {
        await calculateOneBonusperyear(ret[i], runner);
    }
    dt = new Date();
    console.log('updateAllBonusPerYear end  - ' + dt.toLocaleString());
    gfuncs_1.RemoteRun(false);
}
exports.updateAllBonusPerYear = updateAllBonusPerYear;
async function calculateOneBonusperyear(code, runner) {
    try {
        let { id, symbol } = code;
        let pret = await runner.query('tv_股票分红$queryallperyear', [id]);
        let parr = pret;
        if (parr.length <= 0)
            return;
        let ce = {};
        let years = [];
        let i = 0;
        for (i = 0; i < parr.length; ++i) {
            let item = parr[i];
            let { day, bonusyearend } = item;
            if (bonusyearend <= 0)
                continue;
            let year = Math.floor(day / 10000);
            let ys = year.toString();
            let bonus = ce[ys];
            if (bonus !== undefined) {
                ce[ys] = bonus + bonusyearend;
            }
            else {
                ce[ys] = bonusyearend;
                years.push(ys);
            }
        }
        for (i = 0; i < years[i]; ++i) {
            let ys = years[i];
            let bonus = ce[ys];
            await runner.call('t_bonusperyear$save', [id, ys, bonus]);
        }
    }
    catch (err) {
        console.log(err);
    }
}
//# sourceMappingURL=updatedividend.js.map