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
const db_1 = require("../db");
const const_1 = require("../const");
function updateAllDividend() {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield db_1.getRunner(const_1.Const_dbname);
        console.log('updateAllDividend start');
        let ret = [];
        let pageStart = 0, pageSize = 500;
        for (;;) {
            let ids = yield runner.query('tv_股票$search', ['', pageStart, pageSize]);
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
            yield runner.call('tv_dividend$clearall', []);
        }
        catch (err) {
        }
        let rCount = 0;
        let sum = 0;
        for (let i = 0; i < count; ++i) {
            yield calculateOne(ret[i], runner);
        }
        console.log('updateAllDividend completed');
    });
}
exports.updateAllDividend = updateAllDividend;
function checkNull(v) {
    return v === null || v === undefined;
}
function calculateOne(code, runner) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { id, symbol } = code;
            let pret = yield runner.query('tv_股票分红$query', [id, undefined]);
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
                let priceret = yield runner.query('tv_getstocklastprice', [id, 日期]);
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
                yield runner.call('tv_dividend$save', [id, ys, divident]);
            }
            //console.log('updateDividend id: ' + id + ' , ' + symbol);
        }
        catch (err) {
            console.log(err);
        }
    });
}
//# sourceMappingURL=updatedividend.js.map