"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const gfuncs_1 = require("../gfuncs");
const const_1 = require("../const");
const tradeday_1 = require("./tradeday");
const updateStockStatus_1 = require("./updateStockStatus");
const cont_amountInit = 3000000;
const const_EmulatePlanName = 'full-pe11';
const const_weekMaxChangeCount = 3;
const const_pe = 11;
const const_peforsell = 22;
async function emulateTradeFull(yearBegin, monthBegin, yearEnd, monthEnd) {
    if (gfuncs_1.RemoteIsRun())
        return;
    gfuncs_1.RemoteRun(true);
    gfuncs_1.LogWithTime('emulateTradeFull begin');
    try {
        let runner = await db_1.getRunner(const_1.Const_dbname);
        let param = { yearBegin: yearBegin, monthBegin: monthBegin, yearEnd: yearEnd, monthEnd: monthEnd };
        let em = new EmulateTrades(runner);
        await em.processOne(param);
    }
    catch (err) {
        console.log(err);
    }
    gfuncs_1.LogWithTime('emulateTradeFull end');
    gfuncs_1.RemoteRun(false);
}
exports.emulateTradeFull = emulateTradeFull;
function dayFromYearMonth(year, month) {
    return year * 10000 + month * 100 + 1;
}
class EmulateTrades {
    constructor(runner) {
        this.maxWeekChangeCount = const_weekMaxChangeCount;
        this.sellCount = 0;
        this.buyCount = 0;
        this.pechecked = true;
        this.runner = runner;
        this.weekChangeCount = 0;
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
                this.tradeDayisMonthBegin = tradeday_1.isMonthBegin(this.currentTradeDay.day);
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
    async CalculateNextDay() {
        this.sellCount = 0;
        this.buyCount = 0;
        this.peList = await this.loadNewPE();
        await this.loadStocksOrder();
        await updateStockStatus_1.updateStockStatus(this);
        await this.checkSell();
        await this.checkBuyNew();
        //await this.checkChange();
        await this.updateLastStatus();
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
        this.weekChangeCount = 0;
    }
    async CalculateFirst() {
        let details = {
            moneyinit: this.amountInit,
            money: this.amountInit,
            moneyCount: 30,
            shareCount: 0,
            shares: []
        };
        this.emuDetails = details;
        this.emuResult = { type: this.typeID, day: this.typeBeginDay, money: this.amountInit, share: 0, gain: 1 };
        await this.SaveCurrentStatus();
        await this.SaveCurrentDetail(this.typeBeginDay);
    }
    async AddNewStock(stock, volume, price, count = 1, level = 1) {
        let share = {
            stock: stock,
            count: count,
            items: [
                {
                    buyDay: this.currentTradeDay.day,
                    count: count,
                    level: level,
                    volume: volume,
                    costprice: price,
                    price: price
                }
            ]
        };
        await this.buyShareItem(stock, share.items[0]);
        this.emuDetails.shares.push(share);
        return true;
    }
    async sellShareItem(stock, item) {
        let money = item.volume * item.price * 0.998;
        let p = {
            type: this.typeID,
            day: this.currentTradeDay.day,
            stock: stock,
            tradeType: 2,
            price: item.price,
            volume: item.volume
        };
        await this.SaveTrade(p);
        this.emuDetails.moneyCount += item.count;
        this.emuDetails.shareCount -= item.count;
        this.emuDetails.money += money;
    }
    async buyShareItem(stock, item) {
        let money = item.volume * item.price * 1.002;
        let p = {
            type: this.typeID,
            day: this.currentTradeDay.day,
            stock: stock,
            tradeType: 1,
            price: item.price,
            volume: item.volume
        };
        await this.SaveTrade(p);
        this.emuDetails.moneyCount -= item.count;
        this.emuDetails.shareCount += item.count;
        this.emuDetails.money -= money;
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
        await this.runner.call('tv_emulateresult$save', [this.emuResult.type, Math.floor(this.emuResult.day / 100), this.emuResult.money, this.emuResult.share, this.emuResult.gain]);
    }
    async SaveCurrentDetail(day) {
        await this.runner.call('tv_emulateshares$save', [this.typeID, day, JSON.stringify(this.emuDetails)]);
    }
    async SaveTrade(p) {
        await this.runner.call('tv_emulatetrade$add', [p.type, p.day, p.stock, p.tradeType, p.price, p.volume]);
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
    async removeStock(stock) {
        let i = 0;
        while (i < this.emuDetails.shares.length) {
            let share = this.emuDetails.shares[i];
            if (share.stock === stock) {
                for (let k = 0; k < share.items.length; ++k) {
                    await this.sellShareItem(share.stock, share.items[k]);
                    this.sellCount++;
                }
                this.emuDetails.shares.splice(i, 1);
                return;
            }
            ++i;
        }
    }
    async loadNewPE() {
        let shares = this.emuDetails.shares;
        let pes = [];
        for (let i = 0; i < shares.length; ++i) {
            let stock = shares[i].stock;
            let r = await this.runner.call('q_getstockpeatday', [stock, this.currentTradeDay.day]);
            if (r.length <= 0) {
                pes.push({ stock: stock, pe: undefined });
            }
            else {
                pes.push({ stock: stock, pe: r[0].pe });
            }
        }
        return pes;
    }
    async loadStocksOrder() {
        let lastDay = tradeday_1.getLastTradeDay(this.currentTradeDay.day);
        this.stockOrder = await this.runner.call('tv_calcmagicorderdpr', [lastDay, 500]);
        let sum = 0;
        for (let i = 0; i < 50; ++i) {
            sum += this.stockOrder[i].pe;
        }
        let peAvg = sum / 50;
        this.pechecked = peAvg < 25;
    }
    async checkSell() {
        let shares = this.emuDetails.shares;
        let sellAllStocks = [];
        let i = 0;
        for (; i < shares.length; ++i) {
            let si = shares[i];
            let index = this.peList.findIndex(v => v.stock === si.stock);
            let pe = undefined;
            if (index >= 0)
                pe = this.peList[index].pe;
            if (pe < 0 || pe >= const_peforsell && si.count <= 1) {
                sellAllStocks.push(si.stock);
            }
            else if (this.tradeDayisMonthBegin) {
                let item = si.items[0];
                let itemTradeday = tradeday_1.getTradeDayAt(item.buyDay);
                if (this.currentTradeDay.monthno - itemTradeday.monthno >= 12) {
                    sellAllStocks.push(si.stock);
                }
            }
        }
        for (i = 0; i < sellAllStocks.length; ++i) {
            await this.removeStock(sellAllStocks[i]);
        }
    }
    async checkBuyNew() {
        if (this.emuDetails.moneyCount <= 0 || !this.pechecked && !this.tradeDayisMonthBegin)
            return;
        let end = this.stockOrder.length;
        if (end > 50)
            end = 50;
        let i = 0;
        for (; i < end; ++i) {
            let item = this.stockOrder[i];
            if (item.pe > const_pe)
                continue;
            let fi = this.emuDetails.shares.findIndex(v => v.stock === item.stock);
            if (fi >= 0) {
                continue;
            }
            let retPrice = await this.runner.call('tv_getstockpriceatday', [item.stock, this.currentTradeDay.day]);
            if (retPrice.length <= 0)
                continue;
            let price = retPrice[0].price;
            let money = this.emuDetails.money / this.emuDetails.moneyCount;
            let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
            if (volume <= 0)
                continue;
            let r = await this.AddNewStock(item.stock, volume, price);
            this.buyCount++;
            if (this.emuDetails.moneyCount <= 0)
                break;
        }
    }
    async checkChange() {
        if (this.emuDetails.moneyCount > 0 || this.buyCount > 0 || this.weekChangeCount >= this.maxWeekChangeCount)
            return;
    }
}
exports.EmulateTrades = EmulateTrades;
//# sourceMappingURL=emulate.js.map