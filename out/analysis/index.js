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
(async function () {
    gfuncs_1.LogWithTime('analysis begin');
    await data_1.data.init();
    await tradeday_1.initTradeDay(20001201, 20191201);
    let start = tradeday_1.getNextTradeDay(20010101);
    let end = tradeday_1.getLastTradeDay(20190101);
    let step = new step_1.Step(start, end);
    let actions = [
        // {
        //   trader: new TraderYearOverYear(),
        //   rank: new ROE_PE_Dividend_Rank(),
        //   settings: { initcash: 3000000, count: 50 },
        //   recorder: new Recorder('ROE_PE_Dividend_Rank_YearOverYear', start, end)
        // },
        // {
        //   trader: new TraderYearOverYear(),
        //   rank: new ROE_PE_Rank(),
        //   settings: { initcash: 3000000, count: 50 },
        //   recorder: new Recorder('ROE_PE_Rank_YearOverYear', start, end)
        // },
        // {
        //   trader: new TraderYearOverYear(),
        //   rank: new ROE_PE_Magic_Rank(),
        //   settings: { initcash: 3000000, count: 50 },
        //   recorder: new Recorder('ROE_PE_Magic_Rank_YearOverYear', start, end)
        // },
        // {
        //   trader: new TraderYearOverYear(),
        //   rank: new ROE_PE_Magic_CheckE_Rank(),
        //   settings: { initcash: 3000000, count: 50 },
        //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_YearOverYear', start, end)
        // },
        // {
        //   trader: new TraderSeasonOverSeason(),
        //   rank: new ROE_PE_Dividend_Rank(),
        //   settings: { initcash: 3000000, count: 50 },
        //   recorder: new Recorder('ROE_PE_Dividend_Rank_SeasonOverSeason', start, end)
        // },
        // {
        //   trader: new TraderSeasonOverSeason(),
        //   rank: new ROE_PE_Rank(),
        //   settings: { initcash: 3000000, count: 50 },
        //   recorder: new Recorder('ROE_PE_Rank_SeasonOverSeason', start, end)
        // },
        // {
        //   trader: new TraderSeasonOverSeason(),
        //   rank: new ROE_PE_Magic_Rank(),
        //   settings: { initcash: 3000000, count: 50 },
        //   recorder: new Recorder('ROE_PE_Magic_Rank_SeasonOverSeason', start, end)
        // },
        // {
        //   trader: new TraderSeasonOverSeason(),
        //   rank: new ROE_PE_Magic_CheckE_Rank(),
        //   settings: { initcash: 3000000, count: 50 },
        //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_SeasonOverSeason', start, end)
        // },
        {
            trader: new trader_1.TraderMonthOverMonth(24),
            rank: new rank_1.ROE_PE_Dividend_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Dividend_Rank_Month_24', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(24),
            rank: new rank_1.ROE_PE_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Rank_Month_24', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(24),
            rank: new rank_1.ROE_PE_Magic_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Magic_Rank_Month_24', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(24),
            rank: new rank_1.ROE_PE_Magic_CheckE_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Magic_CheckE_Rank_Month_24', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(36),
            rank: new rank_1.ROE_PE_Dividend_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Dividend_Rank_Month_36', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(36),
            rank: new rank_1.ROE_PE_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Rank_Month_36', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(36),
            rank: new rank_1.ROE_PE_Magic_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Magic_Rank_Month_36', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(36),
            rank: new rank_1.ROE_PE_Magic_CheckE_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Magic_CheckE_Rank_Month_36', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(48),
            rank: new rank_1.ROE_PE_Dividend_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Dividend_Rank_Month_48', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(48),
            rank: new rank_1.ROE_PE_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Rank_Month_48', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(48),
            rank: new rank_1.ROE_PE_Magic_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Magic_Rank_Month_48', start, end)
        },
        {
            trader: new trader_1.TraderMonthOverMonth(48),
            rank: new rank_1.ROE_PE_Magic_CheckE_Rank(),
            settings: { initcash: 3000000, count: 50 },
            recorder: new recorder_1.Recorder('ROE_PE_Magic_CheckE_Rank_Month_48', start, end)
        },
    ];
    let simulate = new simulate_1.Simulate(step, actions);
    await simulate.run();
    gfuncs_1.LogWithTime('analysis end');
})();
//# sourceMappingURL=index.js.map