"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
const tradeday_1 = require("./tradeday");
const updateStockStatus_1 = require("./updateStockStatus");
const checkSell_1 = require("./checkSell");
const checkBuyOld_1 = require("./checkBuyOld");
const checkBuyNew_1 = require("./checkBuyNew");
const GroupSize = 30;
const cont_amountInit = 3000000;
const const_EmulatePlanName = '6+1';
async function emulateTrade61(yearBegin, monthBegin, yearEnd, monthEnd) {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    gfuncs_1.LogWithTime('emulateTrade61 begin');
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let param = { yearBegin: yearBegin, monthBegin: monthBegin, yearEnd: yearEnd, monthEnd: monthEnd };
        let em = new EmulateTrades(runner);
        await em.processOne(param);
    }
    catch (err) {
        console.log(err);
    }
    gfuncs_1.LogWithTime('emulateTrade61 end');
    gfuncs_1.RemoteRun(false);
}
exports.emulateTrade61 = emulateTrade61;
function dayFromYearMonth(year, month) {
    return year * 10000 + month * 100 + 1;
}
class EmulateTrades {
    constructor(runner) {
        this.runner = runner;
        this.weekBuyCount = 0;
        this.weekNo = 0;
        this.monthNo = 0;
        this.amountInit = cont_amountInit;
    }
    async initTypeID(dayBegin, dayEnd) {
        let qr = await this.runner.query('tv_emulatetype$getid', [const_EmulatePlanName, dayBegin, dayEnd]);
        let arr = qr;
        if (arr.length > 0) {
            let r = arr[0];
            this.typeID = r.id;
            this.typeBeginDay = dayBegin;
            this.typeEndDay = dayEnd;
            return r;
        }
        qr = await this.runner.call('tv_emulateType$save', [undefined, const_EmulatePlanName, dayBegin, dayEnd]);
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
        this.typeEndDay = dayEnd;
        return ret;
    }
    async processOne(p) {
        try {
            let dayBegin = dayFromYearMonth(p.yearBegin, p.monthBegin);
            let dayEnd = dayFromYearMonth(p.yearEnd, p.monthEnd);
            let type = await this.initTypeID(dayBegin, dayEnd);
            if (type === undefined)
                throw 'cant get emulatetypeid :' + p;
            await tradeday_1.initTradeDay(this.runner, dayFromYearMonth(p.yearBegin - 1, 12), dayEnd);
            await this.runner.call('tv_emulatetype$deletedata', [this.typeID]);
            await this.CalculateFirst();
            let tradeDay = tradeday_1.getTradeDayAt(dayBegin);
            while (tradeDay !== undefined) {
                if (tradeDay.day >= dayEnd)
                    break;
                this.currentTradeDay = tradeDay;
                this.checkNewWeek(tradeDay);
                await this.CalculateNextDay();
                this.lastTradeDay = tradeDay;
                tradeDay = tradeday_1.getNextTradeDay(tradeDay.day);
            }
            console.log('emulate, type=' + type + ',  ' + p.yearBegin + ' - ' + p.monthBegin);
        }
        catch (err) {
            console.log(err);
        }
    }
    checkNewWeek(tradeDay) {
        let weekNo = Math.floor((tradeDay.day % 100) / 3);
        if (weekNo > 2)
            weekNo = 2;
        if (tradeDay.monthno === this.monthNo && weekNo === this.weekNo) {
            return;
        }
        this.monthNo = tradeDay.monthno;
        this.weekNo = weekNo;
        this.weekBuyCount = 0;
    }
    async CalculateFirst() {
        let details = {
            moneyinit: this.amountInit,
            money: this.amountInit,
            moneyCount: 100,
            shareCount: 0,
            shares: []
        };
        this.emuDetails = details;
        this.emuResult = { type: this.typeID, day: this.typeBeginDay, money: this.amountInit, share: 0, gain: 1 };
        await this.SaveCurrentStatus();
        await this.SaveCurrentDetail(this.typeBeginDay);
    }
    async AddNewStock(stock, volume, price) {
        let money = volume * price * 1.002;
        let p = {
            type: this.typeID,
            day: this.currentTradeDay.day,
            stock: stock,
            tradeType: 1,
            price: price,
            volume: volume
        };
        await this.SaveTrade(p);
        let share = {
            stock: stock,
            count: 1,
            items: [
                {
                    buyDay: this.currentTradeDay.day,
                    count: 1,
                    volume: volume,
                    costprice: price,
                    price: price
                }
            ]
        };
        this.emuDetails.moneyCount--;
        this.emuDetails.money -= money;
        this.emuDetails.shareCount++;
        this.emuDetails.shares.push(share);
        this.weekBuyCount++;
        return true;
    }
    async updateLastStatus() {
        this.emuResult.money = this.emuDetails.money;
        let shareSum = 0;
        this.emuDetails.shares.forEach(si => {
            si.items.forEach(v => {
                shareSum += v.volume * v.price;
            });
        });
        this.emuResult.share = shareSum;
        this.emuResult.gain = (this.emuResult.share + this.emuResult.money) / this.emuDetails.moneyinit;
        this.emuResult.day = this.currentTradeDay.day;
        await this.SaveCurrentStatus();
        await this.SaveCurrentDetail(this.currentTradeDay.day);
    }
    async SaveCurrentStatus() {
        await this.runner.call('tv_emulateresult$save', [this.emuResult.type, this.emuResult.day, this.emuResult.money, this.emuResult.share, this.emuResult.gain]);
    }
    async SaveCurrentDetail(day) {
        await this.runner.call('tv_emulateshares$save', [this.typeID, day, JSON.stringify(this.emuDetails)]);
    }
    async SaveTrade(p) {
        await this.runner.call('tv_emulatetrade$save', [p.type, p.day, p.stock, p.tradeType, p.price, p.volume]);
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
    addBouns(money) {
        this.emuDetails.money += money;
    }
    async CalculateNextDay() {
        await updateStockStatus_1.updateStockStatus(this);
        await checkSell_1.checkSell(this);
        await checkBuyOld_1.checkBuyOld(this);
        await checkBuyNew_1.checkBuyNew(this);
        await this.updateLastStatus();
    }
}
exports.EmulateTrades = EmulateTrades;
//# sourceMappingURL=emulate61.js.map