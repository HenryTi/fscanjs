"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const price_1 = require("./price");
const reports_1 = require("./reports");
const data_1 = require("./data");
class Simulate {
    constructor(step, actions) {
        this.step = step;
        this.actions = actions;
    }
    async run() {
        await data_1.data.init();
        let prices = new price_1.Prices();
        let reports = new reports_1.Reports();
        let cash = 3000000;
        let holdings = {};
        for (let action of this.actions) {
            action.trader.initHoldings(cash, holdings);
        }
        for (let date = this.step.first; this.step.isGoing; date = this.step.next) {
            await prices.load(date);
            console.log(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}: ${prices.count}`);
            if (prices.count <= 0)
                continue;
            await reports.load(date);
            for (let action of this.actions) {
                let { trader, rank } = action;
                rank.sort(date, prices, reports);
                trader.trade(date, prices, rank);
            }
        }
    }
}
exports.Simulate = Simulate;
//# sourceMappingURL=simulate.js.map