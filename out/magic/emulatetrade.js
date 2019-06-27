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
const EmulatePlanName = '一直持股';
function emulateTrade() {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner('mi');
            let em = new EmulateTrade(runner);
        }
        catch (err) {
            console.log(err);
        }
        gfuncs_1.RemoteRun(false);
    });
}
exports.emulateTrade = emulateTrade;
class EmulateTrade {
    constructor(runner) {
        this.runner = runner;
    }
    GetEmulateTypeID(dayBegin, dayEnd) {
        return __awaiter(this, void 0, void 0, function* () {
            let qr = yield this.runner.query('getemulateTypeID', const_1.DefaultUnit, undefined, [EmulatePlanName, dayBegin, dayEnd]);
            let arr = qr;
            if (arr.length >= 0) {
                return arr[0];
            }
            qr = yield this.runner.tuidSave('emulateType', const_1.DefaultUnit, undefined, [undefined, EmulatePlanName, dayBegin, dayEnd]);
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
                yield this.runner.query('clearOneEmulateType', const_1.DefaultUnit, undefined, [id]);
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
                        let zf = (priceEx / priceBegin - 1) * 100;
                        sum += zf;
                        yield this.runner.mapSave('神奇公式模拟结果明细', const_1.DefaultUnit, undefined, [groupIndex, date, stock, zf]);
                    }
                }
            }
            if (rCount > 0 && rCount >= GroupSize / 2) {
                sum /= rCount;
                yield this.runner.mapSave('神奇公式模拟结果', const_1.DefaultUnit, undefined, [groupIndex, year, month, sum, rCount]);
            }
        });
    }
}
//# sourceMappingURL=emulatetrade.js.map