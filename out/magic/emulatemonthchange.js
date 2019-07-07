"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
const GroupSize = 30;
const cont_amountInit = 3000000;
const const_EmulatePlanName = '月换股1号';
async function emulateTradeMonthChange() {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let param = { yearBegin: 0, monthBegin: 1, yearEnd: 2019, monthEnd: 6 };
        for (let year = 2001; year < 2019; ++year) {
            for (let month = 1; month <= 12; month += 3) {
                let em = new EmulateTrades(runner);
                param.yearBegin = year;
                param.monthBegin = month;
                await em.processOne(param);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
    gfuncs_1.RemoteRun(false);
}
exports.emulateTradeMonthChange = emulateTradeMonthChange;
function dayFromYearMonth(year, month) {
    return year * 10000 + month * 100 + 1;
}
class EmulateTrades {
    constructor(runner) {
        this.runner = runner;
        this.emuShares = [];
        this.amountInit = cont_amountInit;
    }
    async initTypeID(dayBegin) {
        let qr = await this.runner.query('tv_emulatetype$getid', [const_EmulatePlanName, dayBegin]);
        let arr = qr;
        if (arr.length > 0) {
            let r = arr[0];
            this.typeID = r.id;
            this.typeBeginDay = dayBegin;
            return r;
        }
        qr = await this.runner.call('tv_emulateType$save', [undefined, const_EmulatePlanName, dayBegin]);
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
    }
    async processOne(p) {
        try {
            let dayBegin = dayFromYearMonth(p.yearBegin, p.monthBegin);
            let dayEnd = dayFromYearMonth(p.yearEnd, p.monthEnd);
            let type = await this.initTypeID(dayBegin);
            if (type === undefined)
                throw 'cant get emulatetypeid :' + p;
            await this.runner.call('tv_emulatetype$deletedata', [this.typeID]);
            await this.CalculateFirst(p.yearBegin, p.monthBegin);
            let mb = p.monthBegin + 1;
            for (let y = p.yearBegin; y <= p.yearEnd; ++y) {
                for (let m = mb; y == p.yearEnd ? m <= p.monthEnd : m <= 12; ++m) {
                    await this.CalculateNext(y, m);
                }
                mb = 1;
            }
            console.log('emulate, type=' + type + ',  ' + p.yearBegin + ' - ' + p.monthBegin);
        }
        catch (err) {
            console.log(err);
        }
    }
    async CalculateFirst(year, month) {
        let dayBegin = dayFromYearMonth(year, month);
        let arr = await this.SelectStocks(dayBegin);
        let peavg = this.CalculatePEAvg(arr);
        if (peavg <= 0 || peavg >= 25) {
            return;
        }
        let shares = [];
        let tcount = 0;
        let i;
        let amountOne = this.amountInit / 30;
        let amountSum = 0;
        let emuTrades = [];
        for (i = 0; i < arr.length; ++i) {
            let item = arr[i];
            if (item.pe > 12)
                continue;
            let pi = await this.GetStockNextPrice(item.stock, dayBegin);
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
        await this.SaveTrades(emuTrades);
        await this.SaveCurrentStatus();
    }
    async CalculateNext(year, month) {
        let dayEnd = dayFromYearMonth(year, month);
        let shares = [];
        let i = 0;
        let amoutShares = 0;
        let bonus = 0;
        for (; i < this.emuShares.length; ++i) {
            let si = this.emuShares[i];
            let ci = await this.GetOneStockResult(si.stock, si.day, dayEnd);
            let s = _.clone(si);
            s.day = dayEnd;
            if (ci === undefined) {
                let li = await this.GetStockLastPrice(si.stock, dayEnd);
                if (li !== undefined) {
                    s.price = li.price;
                }
            }
            else {
                let b = 0;
                if (ci.bonus > 0) {
                    b = si.volume * ci.bonus;
                }
                if (ci.rate !== 1) {
                    s.volume = s.volume * ci.rate;
                }
                s.price = ci.priceEnd;
                if (b > 0) {
                    let v = Math.floor(b / s.price / 100) * 100;
                    let m = v * s.price;
                    s.volume += v;
                    bonus += b - m;
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
        await this.SaveCurrentStatus();
    }
    async SaveCurrentStatus() {
        let i = 0;
        for (; i < this.emuShares.length; ++i) {
            let ei = this.emuShares[i];
            await this.runner.call('tv_emulateshares$save', [ei.type, ei.day, ei.stock, ei.price, ei.volume]);
        }
        await this.runner.call('tv_emulateresult$save', [this.emuReulst.type, this.emuReulst.day, this.emuReulst.money, this.emuReulst.share, this.emuReulst.gain]);
    }
    async SaveTrades(p) {
        for (let i = 0; i < p.length; ++i) {
            let ti = p[i];
            await this.runner.call('tv_emulatetrade$save', [ti.type, ti.day, ti.stock, ti.tradeType, ti.price, ti.volume]);
        }
    }
    async SelectStocks(dayBegin) {
        let ret = await this.runner.call('q_calcpeorder', [dayBegin, 0.1, 100]);
        let arr = ret;
        let shares = [];
        let i = 0;
        for (; i < arr.length; ++i) {
            let item = arr[i];
            let { stock, o, pe, roe } = item;
            let r = { stock: stock, order: o, pe: pe, roe: roe };
            shares.push(r);
        }
        return shares;
    }
    CalculatePEAvg(param) {
        let sum = 0;
        let count = 0;
        param.forEach((value) => {
            ++count;
            sum += value.pe;
        });
        if (count <= 0)
            return 0;
        return sum / count;
    }
    async GetOneStockResult(stock, dayBegin, dayEnd) {
        let ret = await this.runner.query('tv_getStockRestoreShare', [stock, dayBegin, dayEnd]);
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
    }
    async GetStockNextPrice(stock, day) {
        let ret = await this.runner.query('tv_getstockpriceafterday', [stock, day]);
        if (ret.length <= 0)
            return undefined;
        let item = ret[0];
        return { price: item.price, day: item.day };
    }
    async GetStockLastPrice(stock, day) {
        let ret = await this.runner.query('tv_getstocklastprice', [stock, day]);
        if (ret.length <= 0)
            return undefined;
        let item = ret[0];
        return { price: item.price, day: item.day };
    }
}
//# sourceMappingURL=emulatemonthchange.js.map