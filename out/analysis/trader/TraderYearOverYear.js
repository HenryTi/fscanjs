"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trader_1 = require("./trader");
const holding_1 = require("../holding");
class TraderYearOverYear extends trader_1.Trader {
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
//# sourceMappingURL=TraderYearOverYear.js.map