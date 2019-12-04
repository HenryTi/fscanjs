"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simulate_1 = require("./simulate");
const step_1 = require("./step");
const trader_1 = require("./trader");
const rank_1 = require("./rank");
const tradeday_1 = require("./tradeday");
const recorder_1 = require("./recorder");
const data_1 = require("./data");
(async function () {
    await data_1.data.init();
    await tradeday_1.initTradeDay(20091201, 20191201);
    let start = tradeday_1.getNextTradeDay(20100101);
    let end = tradeday_1.getLastTradeDay(20190101);
    let step = new step_1.Step(start, end);
    let actions = [
        {
            trader: new trader_1.TraderYearOverYear(),
            rank: new rank_1.ROE_PE_Dividend_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Dividend_Rank_YearOverYear', start, end)
        },
        {
            trader: new trader_1.TraderYearOverYear(),
            rank: new rank_1.ROE_PE_Magic_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Magic_Rank_YearOverYear', start, end)
        },
        {
            trader: new trader_1.TraderYearOverYear(),
            rank: new rank_1.ROE_PE_Magic_CheckE_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Magic_CheckE_Rank_YearOverYear', start, end)
        },
    ];
    let simulate = new simulate_1.Simulate(step, actions);
    await simulate.run();
})();
//# sourceMappingURL=index.js.map