"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 检查前一天，是否有应买，有则根据应买买入
// 检查前一天，是否有应卖，有则根据应卖卖出
// 然后check，生成新的应买和应卖
class Trader {
    initHoldings(cash, holdings) {
        this.cash = cash;
        this.holdings = holdings;
    }
    // 根据应买，买入
    // 根据应卖，卖出
    // check之后，会算出应和应买
    trade(date, prices, rank) {
        this.calcEquity(prices);
        this.internalDailyTrade(date, prices, rank);
    }
    internalDailyTrade(date, prices, rank) {
    }
    calcEquity(prices) {
        let equity = 0;
        for (let i in this.holdings) {
            let holding = this.holdings[i];
            let { stockId, list } = holding;
            let price = prices.map[stockId].close;
            for (let item of list) {
                let { numShares } = item;
                equity += numShares * price;
            }
        }
        this.equity = equity;
    }
    sellHolding(holding) {
        let { stockId, list } = holding;
        for (let item of list) {
            this.sellHoldingItem(stockId, item);
        }
    }
    sellHoldingItem(stockId, holdingItem) {
    }
    buyStock(stockId, price, num) {
    }
}
exports.Trader = Trader;
class Trader6P1 extends Trader {
}
exports.Trader6P1 = Trader6P1;
class Trader2X2 extends Trader {
}
exports.Trader2X2 = Trader2X2;
class TraderYearOverYear extends Trader {
    constructor() {
        super(...arguments);
        this.year = 0;
    }
    internalDailyTrade(date, prices, rank) {
        let year = date.getFullYear();
        if (year === this.year)
            return;
        this.year = year;
        this.sellHoldings();
        let points = rank.queue.slice(0, 50);
        this.buyStocks(points.map(v => v.stockId));
    }
    sellHoldings() {
        let keys = Object.keys(this.holdings);
        for (let i in keys) {
            let holding = this.holdings[i];
            this.sellHolding(holding);
            this.holdings[i] = undefined;
        }
    }
    buyStocks(stockIds) {
    }
}
exports.TraderYearOverYear = TraderYearOverYear;
//# sourceMappingURL=trader.js.map