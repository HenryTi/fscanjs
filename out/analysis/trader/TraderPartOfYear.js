"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trader_1 = require("./trader");
const holding_1 = require("../holding");
class TraderPartOfYear extends trader_1.Trader {
    constructor(begin, end) {
        super();
        this.monthno = 0;
        this.begin = begin;
        this.end = end;
    }
    async internalDailyTrade(date, prices, rank, reports) {
        let monthno = date.monthno;
        if (monthno === this.monthno) {
            await this.checkShouldSell(date, prices);
            await this.checkShouldBuy(date, prices);
            return;
        }
        this.monthno = monthno;
        let month = Math.floor((date.day % 10000) / 100);
        if (month === this.begin) {
            await this.checkShouldSell(date, prices);
            await rank.getAt(date, prices, reports);
            let points = rank.queue.slice(0, 50);
            points.map(v => {
                let buyItem = new holding_1.Holding(v.stockId);
                buyItem.add(date.day, prices.map[v.stockId].price, 0, 0);
                this.shouldBuy.push(buyItem);
            });
        }
        else if (month === this.end) {
            this.sellHoldings(date, prices);
            await this.checkShouldSell(date, prices);
        }
        else {
            await this.checkShouldSell(date, prices);
            await this.checkShouldBuy(date, prices);
        }
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
exports.TraderPartOfYear = TraderPartOfYear;
//# sourceMappingURL=TraderPartOfYear.js.map