"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simulate_1 = require("./simulate");
const step_1 = require("./step");
const trader_1 = require("./trader");
const rank_1 = require("./rank");
const tradeday_1 = require("./tradeday");
const recorder_1 = require("./recorder");
const data_1 = require("./data");
const gfuncs_1 = require("../gfuncs");
const init_cash = 3000000;
const share_count = 50;
(async function () {
    gfuncs_1.LogWithTime('analysis begin');
    await data_1.data.init();
    await tradeday_1.initTradeDay(20001201, 20191201);
    //let start = getNextTradeDay(20010101);
    let start = tradeday_1.getNextTradeDay(20100101);
    let end = tradeday_1.getLastTradeDay(20190101);
    let step = new step_1.Step(start, end);
    let actions = [
        {
            trader: new trader_1.TraderPartOfYear(1, 9),
            rank: new rank_1.ROE_PE_Dividend_Rank(),
            settings: { initcash: init_cash, count: share_count },
            recorder: new recorder_1.Recorder('ROE_PE_Dividend_Rank_TraderPartOfYear1_9', start, end)
        },
        {
            trader: new trader_1.TraderPartOfYear(1, 10),
            rank: new rank_1.ROE_PE_Dividend_Rank(),
            settings: { initcash: init_cash, count: share_count },
            recorder: new recorder_1.Recorder('ROE_PE_Dividend_Rank_TraderPartOfYear1_10', start, end)
        },
        {
            trader: new trader_1.TraderPartOfYear(1, 11),
            rank: new rank_1.ROE_PE_Dividend_Rank(),
            settings: { initcash: init_cash, count: share_count },
            recorder: new recorder_1.Recorder('ROE_PE_Dividend_Rank_TraderPartOfYear1_11', start, end)
        },
        {
            trader: new trader_1.TraderPartOfYear(1, 12),
            rank: new rank_1.ROE_PE_Dividend_Rank(),
            settings: { initcash: init_cash, count: share_count },
            recorder: new recorder_1.Recorder('ROE_PE_Dividend_Rank_TraderPartOfYear1_12', start, end)
        },
    ];
    let simulate = new simulate_1.Simulate(step, actions);
    await simulate.run();
    gfuncs_1.LogWithTime('analysis end');
})();
//# sourceMappingURL=index.js.map