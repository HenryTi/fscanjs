"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simulate_1 = require("./simulate");
const step_1 = require("./step");
const trader_1 = require("./trader");
const rank_1 = require("./rank");
(async function () {
    let start = new Date(2019, 0, 1);
    let end = new Date(2019, 11, 31);
    let y = new Date(start.setFullYear(start.getFullYear() + 1));
    console.log(y);
    let step = new step_1.Step(start, end);
    let actions = [
        {
            trader: new trader_1.TraderYearOverYear(),
            rank: new rank_1.ROERank(),
        }
    ];
    let simulate = new simulate_1.Simulate(step, actions);
    await simulate.run();
})();
//# sourceMappingURL=index.js.map