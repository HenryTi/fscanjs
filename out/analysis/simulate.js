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
        let holdings = {};
        for (let action of this.actions) {
            await action.recorder.init();
            let { initcash, count } = action.settings;
            action.trader.initHoldings(initcash, count, holdings, action.recorder);
        }
        for (let date = this.step.first; this.step.isGoing; date = this.step.next) {
            await prices.load(date);
            if (prices.count <= 0)
                continue;
            await reports.load(date);
            for (let action of this.actions) {
                let { trader, rank, recorder } = action;
                //await rank.sort(date, prices, reports);
                await trader.trade(date, prices, rank, reports);
            }
        }
    }
}
exports.Simulate = Simulate;
//# sourceMappingURL=simulate.js.map