"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trader_1 = require("./trader");
const holding_1 = require("../holding");
class TraderMonthOverMonth extends trader_1.Trader {
    constructor() {
        super(...arguments);
        this.month = 0;
    }
    async internalDailyTrade(date, prices, rank, reports) {
        let month = date.monthno;
        if (month === this.month) {
            await this.checkShouldSell(date, prices);
            await this.checkShouldBuy(date, prices);
            return;
        }
        this.month = month;
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