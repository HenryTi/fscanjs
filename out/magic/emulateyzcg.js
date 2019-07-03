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
const _ = require("lodash");
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
const GroupSize = 30;
const cont_amountInit = 3000000;
const const_EmulatePlanName = '一直持股';
function emulateTrade() {
    return __awaiter(this, void 0, void 0, function* () {
        if (gfuncs_1.RemoteIsRun())
            return;
        gfuncs_1.RemoteRun(true);
        try {
            let runner = yield db_1.getRunner(const_1.Const_dbname);
            let param = { yearBegin: 0, monthBegin: 1, yearEnd: 2019, monthEnd: 6 };
            for (let year = 2001; year < 2019; ++year) {
                for (let month = 1; month <= 12; month += 3) {
                    let em = new EmulateTrades(runner);
                    param.yearBegin = year;
                    param.monthBegin = month;
                    yield em.processOne(param);
                    console.log('emulate: ' + year + ' - ' + month);
                    break;
                }
                break;
            }
        }
        catch (err) {
            console.log(err);
        }
        gfuncs_1.RemoteRun(false);
    });
}
exports.emulateTrade = emulateTrade;
function dayFromYearMonth(year, month) {
    return year * 10000 + month * 100 + 1;
}
class EmulateTrades {
    constructor(runner) {
        this.runner = runner;
        this.emuShares = [];
        this.amountInit = cont_amountInit;
    }
    initTypeID(dayBegin) {
        return __awaiter(this, void 0, void 0, function* () {
            let qr = yield this.runner.query('tv_emulatetype$getid', [const_EmulatePlanName, dayBegin]);
            let arr = qr;
            if (arr.length > 0) {
                let r = arr[0];
                this.typeID = r.id;
                this.typeBeginDay = dayBegin;
                return r;
            }
            qr = yield this.runner.call('tv_emulateType$save', [undefined, const_EmulatePlanName, dayBegin]);
            arr = qr;
            if (arr.length <= 0) {
                return undefined;
            }
            let id = arr[0].id;
            if (id === undefined || id <= 0)
                return undefined;
            let ret = { id: id, name: const_EmulatePlanName, begin: dayBegin };
            this.typeID = id;
            this.typeBeginDay = dayBegin;
            return ret;
        });
    }
    processOne(p) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let dayBegin = dayFromYearMonth(p.yearBegin, p.monthBegin);
                let dayEnd = dayFromYearMonth(p.yearEnd, p.monthEnd);
                let type = yield this.initTypeID(dayBegin);
                if (type === undefined)
                    throw 'cant get emulatetypeid :' + p;
                yield this.runner.call('tv_emulatetype$deletedata', [this.typeID]);
                yield this.CalculateFirst(p.yearBegin, p.monthBegin);
                let mb = p.monthBegin + 1;
                for (let y = p.yearBegin; y <= p.yearEnd; ++y) {
                    for (let m = mb; y == p.yearEnd ? m <= p.monthEnd : m <= 12; ++m) {
                        yield this.CalculateNext(y, m);
                    }
                    mb = 1;
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    CalculateFirst(year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            let dayBegin = dayFromYearMonth(year, month);
            let arr = yield this.SelectStocks(dayBegin);
            let shares = [];
            let tcount = 0;
            let i;
            let amountOne = this.amountInit / 30;
            let amountSum = 0;
            let emuTrades = [];
            for (i = 60; i < arr.length; ++i) {
                let item = arr[i];
                let pi = yield this.GetStockNextPrice(item.stock, dayBegin);
                if (pi === undefined || pi.day > dayBegin + 15) {
                    continue;
                }
                let volume = Math.floor(amountOne / pi.price / 100) * 100;
                let s = { type: this.typeID, day: dayBegin, stock: item.stock, price: pi.price, volume: volume };
                amountSum += volume * pi.price;
                shares.push(s);
                emuTrades.push({ type: this.typeID, day: dayBegin, stock: item.stock, tradeType: 1, price: pi.price, volume: volume });
                ++tcount;
                if (tcount >= 30)
                    break;
            }
            this.emuShares = shares;
            this.emuReulst = { type: this.typeID, day: dayBegin, money: this.amountInit - amountSum, share: amountSum, gain: 1 };
            yield this.SaveTrades(emuTrades);
            yield this.SaveCurrentStatus();
        });
    }
    CalculateNext(year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            let dayEnd = dayFromYearMonth(year, month);
            let shares = [];
            let i = 0;
            let amoutShares = 0;
            let bonus = 0;
            for (; i < this.emuShares.length; ++i) {
                let si = this.emuShares[i];
                let ci = yield this.GetOneStockResult(si.stock, si.day, dayEnd);
                let s = _.clone(si);
                s.day = dayEnd;
                if (ci === undefined) {
                    let li = yield this.GetStockLastPrice(si.stock, dayEnd);
                    if (li !== undefined) {
                        s.price = li.price;
                    }
                }
                else {
                    if (ci.bonus > 0) {
                        bonus += si.volume * ci.bonus;
                    }
                    s.price = ci.priceEnd;
                    if (ci.rate !== 1) {
                        s.volume = s.volume * ci.rate;
                    }
                }
                shares.push(s);
                amoutShares += s.price * s.volume;
            }
            let er = _.clone(this.emuReulst);
            er.day = dayEnd;
            er.money += bonus;
            er.share = amoutShares;
            er.gain = (er.money + er.share) / this.amountInit;
            this.emuShares = shares;
            this.emuReulst = er;
            yield this.SaveCurrentStatus();
        });
    }
    SaveCurrentStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let i = 0;
            for (; i < this.emuShares.length; ++i) {
                let ei = this.emuShares[i];
                yield this.runner.call('tv_emulateshares$save', [ei.type, ei.day, ei.stock, ei.price, ei.volume]);
            }
            yield this.runner.call('tv_emulateresult$save', [this.emuReulst.type, this.emuReulst.day, this.emuReulst.money, this.emuReulst.share, this.emuReulst.gain]);
        });
    }
    SaveTrades(p) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < p.length; ++i) {
                let ti = p[i];
                yield this.runner.call('tv_emulatetrade$save', [ti.type, ti.day, ti.stock, ti.tradeType, ti.price, ti.volume]);
            }
        });
    }
    SelectStocks(dayBegin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.runner.call('tv_calcemulateyzcg', [dayBegin]);
            let ret = yield this.runner.query('tv_getyzcgorderresult', [200]);
            let arr = ret;
            let shares = [];
            let i = 0;
            for (; i < arr.length; ++i) {
                let item = arr[i];
                let { stock, order, pe, roe } = item;
                let r = { stock: stock, order: order, pe: pe, roe: roe };
                shares.push(r);
            }
            return shares;
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
    GetStockNextPrice(stock, day) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield this.runner.query('tv_getstockpriceafterday', [stock, day]);
            if (ret.length <= 0)
                return undefined;
            let item = ret[0];
            return { price: item.price, day: item.day };
        });
    }
    GetStockLastPrice(stock, day) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield this.runner.query('tv_getstocklastprice', [stock, day]);
            if (ret.length <= 0)
                return undefined;
            let item = ret[0];
            return { price: item.price, day: item.day };
        });
    }
}
//# sourceMappingURL=emulateyzcg.js.map