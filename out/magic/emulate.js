"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../uq-api/db");
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
const GroupSize = 30;
const MaxGroup = 80;
function emulateAtDay(date) {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner('mi');
            let em = new EmulateMagic(runner);
            console.log('emulate begin day: ' + date);
            let year = Math.floor(date / 10000);
            let month = date % 10000;
            let yearlen = month % 100;
            if (yearlen < 1 || yearlen > 5) {
                yearlen = 5;
            }
            month = Math.floor(month / 100);
            date = year * 10000 + month * 100 + 1;
            let p = { year: year, month: month, day: 1, date: date, yearlen: yearlen };
            yield runner.query('clear神奇公式模拟结果', const_1.DefaultUnit, undefined, [year, month, yearlen]);
            yield em.proceeOneDay(p);
            console.log('emulate end day: ' + date);
        }
        catch (err) {
            console.log(err);
        }
        gfuncs_1.RemoteRun(false);
    });
}
exports.emulateAtDay = emulateAtDay;
function emulateAll() {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner('mi');
            let em = new EmulateMagic(runner);
            let sql = 'delete from tv_神奇公式模拟结果 where 1=1';
            yield runner.sql(sql, []);
            for (let yearlen = 5; yearlen >= 1; --yearlen) {
                for (let year = 2001; year < 2019; ++year) {
                    for (let month = 1; month <= 12; month += 1) {
                        let date = year * 10000 + month * 100 + 1;
                        if (date > 20180601)
                            break;
                        let p = { year: year, month: month, day: 1, date: date, yearlen: yearlen };
                        yield em.proceeOneDay(p);
                        console.log('emulate end. yearlen: ' + yearlen + '  day: ' + date);
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
        gfuncs_1.RemoteRun(false);
    });
}
exports.emulateAll = emulateAll;
function allStocksAvg(begin, end) {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner('mi');
            let ret = [];
            let pageStart = 0, pageSize = 500;
            for (;;) {
                let ids = yield runner.tuidSeach('股票', const_1.DefaultUnit, undefined, undefined, '', pageStart, pageSize);
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
            let dayBegin = begin > 0 ? begin : 20110101;
            let dayEnd = end > 0 ? end : 20190101;
            for (let i = 0; i < count; ++i) {
                let code = ret[i];
                let { id } = code;
                let pret = yield runner.query('getStockRestorePrice', const_1.DefaultUnit, undefined, [id, dayBegin, dayEnd]);
                let parr = pret;
                let r = parr[0];
                if (r !== undefined) {
                    let { priceBegin, priceEx, bonus, bday } = r;
                    if (bday - dayBegin < 300) {
                        priceEx = priceEx + bonus;
                        if (priceBegin > 0 && priceEx > 0) {
                            ++rCount;
                            let one = (priceEx / priceBegin - 1) * 100;
                            sum += one;
                        }
                    }
                }
            }
            if (rCount > 0) {
                sum = sum / rCount;
                console.log('股数: ' + rCount + '  平均涨幅：' + sum + ' dayBegin=' + dayBegin + ' dayEnd=' + dayEnd);
                yield runner.mapSave('股市平均涨幅', const_1.DefaultUnit, undefined, [dayBegin, dayEnd, sum, rCount]);
            }
        }
        catch (err) { }
        gfuncs_1.RemoteRun(false);
    });
}
exports.allStocksAvg = allStocksAvg;
class EmulateMagic {
    constructor(runner) {
        this.runner = runner;
    }
    proceeOneDay(p) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { year, month, yearlen, date } = p;
                let rowroe = [date, yearlen];
                yield this.runner.query('calcMagicOrder', const_1.DefaultUnit, undefined, rowroe);
                let ret = yield this.runner.query('getmagicorderresult', const_1.DefaultUnit, undefined, []);
                let arr = ret;
                let dayEnd = date + 10000;
                for (let i = 0; i < MaxGroup; ++i) {
                    yield this.CalculateOneGroup(date, dayEnd, arr, i, p);
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    CalculateOneGroup(dayBegin, dayEnd, codes, groupIndex, p) {
        return __awaiter(this, void 0, void 0, function* () {
            let { year, month, yearlen, date } = p;
            let count = codes.length;
            let i = groupIndex * GroupSize;
            let end = i + GroupSize;
            if (end > count)
                return;
            let rCount = 0;
            let sum = 0;
            for (; i < end; ++i) {
                let code = codes[i];
                let { stock } = code;
                let pret = yield this.runner.query('getStockRestorePrice', const_1.DefaultUnit, undefined, [stock, dayBegin, dayEnd]);
                let parr = pret;
                let r = parr[0];
                if (r !== undefined) {
                    let { priceBegin, priceEx, bonus } = r;
                    priceEx = priceEx + bonus;
                    if (priceBegin > 0 && priceEx > 0) {
                        ++rCount;
                        sum += (priceEx / priceBegin - 1) * 100;
                    }
                }
            }
            if (rCount > 0 && rCount >= GroupSize / 2) {
                sum /= rCount;
                yield this.runner.mapSave('神奇公式模拟结果', const_1.DefaultUnit, undefined, [groupIndex, year, month, yearlen, sum, rCount]);
            }
        });
    }
}
//# sourceMappingURL=emulate.js.map