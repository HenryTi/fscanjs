"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const holding_1 = require("./holding");
const data_1 = require("./data");
// 检查前一天，是否有应买，有则根据应买买入
// 检查前一天，是否有应卖，有则根据应卖卖出
// 然后check，生成新的应买和应卖
class Trader {
    initHoldings(cash, cashCount, holdings, recorder) {
        this.shouldBuy = [];
        this.shouldSell = [];
        this.initcash = cash;
        this.recorder = recorder;
        this.cash = cash;
        this.cashCount = cashCount;
        this.holdings = JSON.parse(JSON.stringify(holdings));
    }
    // 根据应买，买入
    // 根据应卖，卖出
    // check之后，会算出应和应买
    async trade(date, prices, rank, reports) {
        await this.updateStockStatus(date, prices);
        await this.internalDailyTrade(date, prices, rank, reports);
        this.calcEquity(prices);
        await this.recordStatus(date);
    }
    async updateStockStatus(date, prices) {
        for (let i in this.holdings) {
            let holding = this.holdings[i];
            let { stockId, list } = holding;
            let price = prices.map[stockId];
            let divRet = await data_1.data.getStockDivInfo(stockId, date.day);
            if (divRet !== undefined) {
                let newPrice = price.price;
                let { s, p, price: peiprice, bonus } = divRet;
                for (let v of list) {
                    if (bonus > 0) {
                        let money = v.volume * bonus / 10;
                        let p = {
                            type: this.recorder.typeID,
                            day: date.day,
                            stock: stockId,
                            tradeType: 10,
                            price: bonus / 10,
                            volume: v.volume
                        };
                        await this.recorder.saveTrade(p);
                        this.cash += money;
                    }
                    let oldVolume = v.volume;
                    let oldCost = v.buyPrice;
                    if (s > 0) {
                        let svolume = Math.floor(oldVolume * s / 10);
                        let p = {
                            type: this.recorder.typeID,
                            day: date.day,
                            stock: stockId,
                            tradeType: 3,
                            price: newPrice,
                            volume: svolume
                        };
                        await this.recorder.saveTrade(p);
                        v.volume = oldVolume + svolume;
                        v.buyPrice = oldCost / (1 + s);
                    }
                    if (p > 0) {
                        let pvolume = Math.floor(oldVolume * p / 10);
                        let adjustVolume = Math.floor((pvolume * peiprice) / newPrice);
                        if (adjustVolume < v.volume) {
                            let p = {
                                type: this.recorder.typeID,
                                day: date.day,
                                stock: stockId,
                                tradeType: 4,
                                price: newPrice,
                                volume: adjustVolume
                            };
                            await this.recorder.saveTrade(p);
                            p.tradeType = 5;
                            p.price = peiprice;
                            p.volume = pvolume;
                            await this.recorder.saveTrade(p);
                            let cost = v.volume * v.buyPrice;
                            v.volume = v.volume + pvolume - adjustVolume;
                            v.buyPrice = cost / v.volume;
                        }
                    }
                }
            }
        }
    }
    async internalDailyTrade(date, prices, rank, reports) {
    }
    calcEquity(prices) {
        let equity = 0;
        for (let i in this.holdings) {
            let holding = this.holdings[i];
            let { stockId, list } = holding;
            let price = prices.map[stockId].price;
            for (let item of list) {
                let { volume } = item;
                equity += volume * price;
            }
        }
        this.equity = equity;
    }
    async checkShouldSell(date, prices) {
        let i = 0;
        while (i < this.shouldSell.length) {
            let holding = this.shouldSell[i];
            let nprice = prices.map[holding.stockId];
            if (nprice.day < date.day) {
                ++i;
            }
            else {
                await this.sellHolding(holding, date, prices);
                this.shouldSell.splice(i, 1);
            }
        }
    }
    async checkShouldBuy(date, prices) {
        let i = 0;
        while (i < this.shouldBuy.length) {
            let holding = this.shouldBuy[i];
            let count = holding.getTotalCount();
            if (count > this.cashCount) {
                ++i;
                continue;
            }
            let nprice = prices.map[holding.stockId];
            if (nprice === undefined || nprice.day < date.day) {
                ++i;
            }
            else {
                await this.buyHolding(holding, date, prices);
                this.shouldBuy.splice(i, 1);
            }
        }
    }
    async sellHolding(holding, date, prices) {
        let { stockId, list } = holding;
        for (let item of list) {
            await this.sellHoldingItem(stockId, item, date, prices);
        }
    }
    async sellHoldingItem(stockId, holdingItem, date, prices) {
        let sellPrice = prices.map[stockId].open;
        let money = sellPrice * holdingItem.volume * 0.998;
        this.cash += money;
        this.cashCount += holdingItem.count;
        let p = {
            type: this.recorder.typeID,
            day: date.day,
            stock: stockId,
            tradeType: 2,
            price: sellPrice,
            volume: holdingItem.volume
        };
        await this.recorder.saveTrade(p);
    }
    async buyHolding(holding, date, prices) {
        if (this.cashCount <= 0)
            return;
        let { stockId, list } = holding;
        let buyPrice = prices.map[stockId].open;
        let money = this.cash / this.cashCount;
        for (let item of list) {
            if (this.cashCount < item.count)
                continue;
            let volume = Math.floor(money * 0.998 * item.count / buyPrice / 100) * 100;
            if (volume > 0) {
                await this.buyStock(stockId, buyPrice, volume, date, item.level, item.count);
            }
        }
    }
    async buyStock(stockId, price, num, date, level = 1, count = 1) {
        let holding = this.holdings[stockId];
        if (holding === undefined) {
            holding = new holding_1.Holding(stockId);
            this.holdings[stockId] = holding;
        }
        let p = {
            type: this.recorder.typeID,
            day: date.day,
            stock: stockId,
            tradeType: 1,
            price: price,
            volume: num
        };
        let money = price * num * 1.002;
        this.cash -= money;
        this.cashCount -= count;
        await this.recorder.saveTrade(p);
        holding.add(date.day, price, num, money, level, count);
    }
    async recordStatus(date) {
        let gain = (this.cash + this.equity) / this.initcash;
        await this.recorder.SaveStatus(this.cash, date, this.equity, gain);
        let detail = {
            cash: this.cash,
            equity: this.equity,
            cashCount: this.cashCount,
            holdings: this.holdings
        };
        let detailStr = JSON.stringify(detail);
        await this.recorder.SaveDetails(date, detailStr);
    }
}
exports.Trader = Trader;
class Trader6P1 extends Trader {
}
exports.Trader6P1 = Trader6P1;
class Trader2X2 extends Trader {
}
exports.Trader2X2 = Trader2X2;
class TraderPerMonth extends Trader {
    constructor() {
        super(...arguments);
        this.monthno = 0;
    }
    async internalDailyTrade(date, prices, rank, reports) {
        if (this.monthno === date.monthno) {
            await this.checkShouldSell(date, prices);
            await this.checkShouldBuy(date, prices);
            return;
        }
        this.monthno = date.monthno;
        await rank.sort(date, prices, reports);
        //
        //
    }
}
exports.TraderPerMonth = TraderPerMonth;
class TraderYearOverYear extends Trader {
    constructor() {
        super(...arguments);
        this.year = 0;
    }
    async internalDailyTrade(date, prices, rank, reports) {
        let year = date.year; // Math.floor(date.day / 100);
        if (year === this.year) {
            await this.checkShouldSell(date, prices);
            await this.checkShouldBuy(date, prices);
            return;
        }
        this.year = year;
        await rank.sort(date, prices, reports);
        this.sellHoldings(date, prices);
        await this.checkShouldSell(date, prices);
        let points = rank.queue.slice(0, 50);
        points.map(v => {
            let buyItem = new holding_1.Holding(v.stockId);
            buyItem.add(date.day, prices.map[v.stockId].price, 0, 0);
            this.shouldBuy.push(buyItem);
        });
    }
    sellHoldings(date, prices) {
        let keys = Object.keys(this.holdings);
        for (let i of keys) {
            let holding = this.holdings[i];
            this.shouldSell.push(holding);
            delete this.holdings[i];
        }
    }
}
exports.TraderYearOverYear = TraderYearOverYear;
//# sourceMappingURL=trader.js.map