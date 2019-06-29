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
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
const GroupSize = 30;
const EmulatePlanName = '一直持股';
function emulateTrade() {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner(const_1.Const_dbname);
            let em = new EmulateTrades(runner);
        }
        catch (err) {
            console.log(err);
        }
        gfuncs_1.RemoteRun(false);
    });
}
exports.emulateTrade = emulateTrade;
class EmulateTrades {
    constructor(runner) {
        this.runner = runner;
    }
    GetEmulateTypeID(dayBegin, dayEnd) {
        return __awaiter(this, void 0, void 0, function* () {
            let qr = yield this.runner.query('tv_getemulateTypeID', [EmulatePlanName, dayBegin, dayEnd]);
            let arr = qr;
            if (arr.length >= 0) {
                return arr[0];
            }
            qr = yield this.runner.call('tv_emulateType$save', [undefined, EmulatePlanName, dayBegin, dayEnd]);
            arr = qr;
            if (arr.length <= 0) {
                return undefined;
            }
            let id = arr[0].id;
            if (id === undefined || id <= 0)
                return undefined;
            let ret = { id: id, name: EmulatePlanName, begin: dayBegin, end: dayEnd };
            return ret;
        });
    }
    proceeOne(p) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { dateBegin, dateEnd } = p;
                let type = yield this.GetEmulateTypeID(dateBegin, dateEnd);
                if (type === undefined)
                    throw 'cant get emulatetypeid :' + p;
                let { id } = type;
                yield this.runner.call('tv_emulatetype$deletedata', [id]);
                yield this.CalculateOneDay(id, p);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    CalculateOneDay(id, p) {
        return __awaiter(this, void 0, void 0, function* () {
            let { dateBegin, dateEnd } = p;
            yield this.runner.call('tv_calcemulateyzcg', [dateBegin]);
            let ret = yield this.runner.query('tv_getyzcgorderresult', [50]);
            let arr = ret;
            let shares = [];
            let i = 0;
            for (; i < 30 && i < arr.length; ++i) {
                let item = arr[i];
                let { stock } = item;
                let r = yield this.GetOneStockResult(stock, dateBegin, dateEnd);
                if (r !== undefined) {
                    shares.push(r);
                }
            }
            let count = shares.length;
            if (count <= 0)
                return;
            let amountAll = 3000000;
            let amountOne = amountAll / count;
            let emuTrades = [];
            let emuShares = [];
            let emuResult = {
                type: id, day: dateEnd, money: 0, share: 0, gain: 0
            };
            for (i = 0; i < count; ++i) {
                let item = shares[i];
            }
        });
    }
    GetOneStockResult(stock, dayBegin, dayEnd) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield this.runner.query('tv_getStockRestoreShare', [stock, dayBegin, dayEnd]);
            if (ret.length <= 0)
                return undefined;
            let { priceBegin, bday, priceEnd, eday, rate, bonus } = ret[0];
            return {
                stock: stock,
                priceBegin: priceBegin,
                dayBegin: bday,
                priceEnd: priceEnd,
                dayEnd: eday,
                rate: rate,
                bonus: bonus
            };
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
                let pret = yield this.runner.query('tv_getStockRestorePrice', [stock, dayBegin, dayEnd]);
                let parr = pret;
                let r = parr[0];
                if (r !== undefined) {
                    let { priceBegin, priceEx, bonus } = r;
                    priceEx = priceEx + bonus;
                    if (priceBegin > 0 && priceEx > 0) {
                        ++rCount;
                        let zf = (priceEx / priceBegin - 1) * 100;
                        sum += zf;
                        yield this.runner.call('tv_神奇公式模拟结果明细$save', [groupIndex, date, stock, zf]);
                    }
                }
            }
            if (rCount > 0 && rCount >= GroupSize / 2) {
                sum /= rCount;
                yield this.runner.call('tv_神奇公式模拟结果$save', [groupIndex, year, month, sum, rCount]);
            }
        });
    }
}
//# sourceMappingURL=emulateyzcg.js.map