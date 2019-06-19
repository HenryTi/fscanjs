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
const const_1 = require("../const");
const GroupSize = 30;
function emulateAtDay(day) {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield db_1.getRunner('mi');
        let em = new EmulateMagic(runner);
        try {
            console.log('emulate begin day: ' + day);
            yield em.proceeOneDay(day);
            console.log('emulate end day: ' + day);
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.emulateAtDay = emulateAtDay;
function emulateAll() {
    return __awaiter(this, void 0, void 0, function* () {
        let runner = yield db_1.getRunner('mi');
        let em = new EmulateMagic(runner);
        try {
            for (let year = 2010; year < 2019; ++year) {
                for (let month = 1; month < 13; ++month) {
                    let date = year * 10000 + month * 100 + 1;
                    if (date > 20180601)
                        break;
                    console.log('emulate begin day: ' + date);
                    let p = { year: year, month: month, day: 1, date: date };
                    yield em.proceeOneDay(p);
                    console.log('emulate end day: ' + date);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.emulateAll = emulateAll;
class EmulateMagic {
    constructor(runner) {
        this.runner = runner;
    }
    proceeOneDay(p) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { year, month, day, date } = p;
                let lastyear = Math.floor(date / 10000) - 1;
                let rowroe = [lastyear];
                yield this.runner.query('calcRoeOrder', const_1.DefaultUnit, undefined, rowroe);
                let rowpe = [date];
                yield this.runner.query('calcPeOrder', const_1.DefaultUnit, undefined, rowpe);
                let ret = yield this.runner.query('getmagicorderresult', const_1.DefaultUnit, undefined, []);
                let arr = ret;
                let dayEnd = date + 10000;
                for (let i = 0; i < 33; ++i) {
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
            let { year, month, day, date } = p;
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
                yield this.runner.mapSave('神奇公式模拟结果', const_1.DefaultUnit, undefined, [groupIndex, year, month, day, sum, rCount]);
                console.log('save magicgroup ' + groupIndex);
            }
        });
    }
}
//# sourceMappingURL=emulate.js.map