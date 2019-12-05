"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trader_1 = require("./trader");
const holding_1 = require("../holding");
class TraderMonthOverMonth extends trader_1.Trader {
    constructor(intervalCount = 1) {
        super();
        this.monthno = 0;
        this.tradeMonthno = -1;
        this.intervalCount = intervalCount;
    }
    async internalDailyTrade(date, prices, rank, reports) {
        let monthno = date.monthno;
        if (monthno === this.monthno || (this.tradeMonthno >= 0 && monthno - this.tradeMonthno < this.intervalCount)) {
            await this.checkShouldSell(date, prices);
            await this.checkShouldBuy(date, prices);
            return;
        }
        this.monthno = monthno;
        this.tradeMonthno = monthno;
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
exports.TraderMonthOverMonth = TraderMonthOverMonth;
//# sourceMappingURL=TraderMonthOverMonth.js.map