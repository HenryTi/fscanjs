import { Simulate } from "./simulate";
import { Step } from "./step";
import { TraderYearOverYear, TraderSeasonOverSeason, TraderMonthOverMonth, Trader } from "./trader";
import { ROERank, ROE_PE_Dividend_Rank, ROE_PE_Magic_Rank, ROE_PE_Magic_CheckE_Rank, ROE_PE_Rank } from "./rank";
import { TradeDay, getNextTradeDay, getLastTradeDay, initTradeDay } from "./tradeday";
import { Recorder } from "./recorder";
import { Settings } from "./settings";
import { data } from "./data";
import { LogWithTime } from "../gfuncs";

(async function () {
  LogWithTime('analysis begin');
  await data.init();
  await initTradeDay(20001201, 20191201);
  let start = getNextTradeDay(20010101);
  let end = getLastTradeDay(20190101);
  let step = new Step(start, end);
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
      trader: new TraderMonthOverMonth(6),
      rank: new ROE_PE_Dividend_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Dividend_Rank_Month_6', start, end)
    },
    {
      trader: new TraderMonthOverMonth(6),
      rank: new ROE_PE_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Rank_Month_6', start, end)
    },
    {
      trader: new TraderMonthOverMonth(6),
      rank: new ROE_PE_Magic_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Magic_Rank_Month_6', start, end)
    },
    {
      trader: new TraderMonthOverMonth(6),
      rank: new ROE_PE_Magic_CheckE_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_6', start, end)
    },
    {
      trader: new TraderMonthOverMonth(18),
      rank: new ROE_PE_Dividend_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Dividend_Rank_Month_18', start, end)
    },
    {
      trader: new TraderMonthOverMonth(18),
      rank: new ROE_PE_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Rank_Month_18', start, end)
    },
    {
      trader: new TraderMonthOverMonth(18),
      rank: new ROE_PE_Magic_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Magic_Rank_Month_18', start, end)
    },
    {
      trader: new TraderMonthOverMonth(18),
      rank: new ROE_PE_Magic_CheckE_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_18', start, end)
    },
  ];

  let simulate = new Simulate(step, actions);
  await simulate.run();
  LogWithTime('analysis end');
})();
