import { Simulate } from "./simulate";
import { Step } from "./step";
import { TraderYearOverYear, TraderPartOfYear, TraderSeasonOverSeason, TraderMonthOverMonth, Trader } from "./trader";
import { ROERank, ROE_PE_Dividend_Rank, ROE_PE_Magic_Rank, ROE_PE_Magic_CheckE_Rank, ROE_PE_Rank } from "./rank";
import { TradeDay, getNextTradeDay, getLastTradeDay, initTradeDay } from "./tradeday";
import { Recorder } from "./recorder";
import { Settings } from "./settings";
import { data } from "./data";
import { LogWithTime } from "../gfuncs";

const init_cash: number = 3000000;
const share_count: number = 50;

(async function () {
  LogWithTime('analysis begin');
  await data.init();
  await initTradeDay(20001201, 20191201);
  //let start = getNextTradeDay(20010101);
  let start = getNextTradeDay(20100101);
  let end = getLastTradeDay(20190101);
  let step = new Step(start, end);
  let actions = [
    {
      trader: new TraderPartOfYear(1, 9),
      rank: new ROE_PE_Dividend_Rank(),
      settings: { initcash: init_cash, count: share_count },
      recorder: new Recorder('ROE_PE_Dividend_Rank_TraderPartOfYear1_9', start, end)
    },
    {
      trader: new TraderPartOfYear(1, 10),
      rank: new ROE_PE_Dividend_Rank(),
      settings: { initcash: init_cash, count: share_count },
      recorder: new Recorder('ROE_PE_Dividend_Rank_TraderPartOfYear1_10', start, end)
    },
    {
      trader: new TraderPartOfYear(1, 11),
      rank: new ROE_PE_Dividend_Rank(),
      settings: { initcash: init_cash, count: share_count },
      recorder: new Recorder('ROE_PE_Dividend_Rank_TraderPartOfYear1_11', start, end)
    },
    {
      trader: new TraderPartOfYear(1, 12),
      rank: new ROE_PE_Dividend_Rank(),
      settings: { initcash: init_cash, count: share_count },
      recorder: new Recorder('ROE_PE_Dividend_Rank_TraderPartOfYear1_12', start, end)
    },
    // {
    //   trader: new TraderYearOverYear(),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_YearOverYear', start, end)
    // },
    // {
    //   trader: new TraderYearOverYear(),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_YearOverYear', start, end)
    // },
    // {
    //   trader: new TraderYearOverYear(),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_YearOverYear', start, end)
    // },
    // {
    //   trader: new TraderYearOverYear(),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_YearOverYear', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(3),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_3', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(3),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_3', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(3),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_3', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(3),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_3', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(6),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_6', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(6),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_6', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(6),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_6', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(6),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_6', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(9),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_9', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(9),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_9', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(9),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_9', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(9),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_9', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(15),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_15', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(15),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_15', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(15),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_15', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(15),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_15', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(18),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_18', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(18),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_18', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(18),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_18', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(18),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_18', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(21),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_21', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(21),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_21', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(21),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_21', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(21),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_21', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(24),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_24', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(24),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_24', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(24),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_24', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(24),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_24', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(36),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_36', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(36),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_36', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(36),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_36', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(36),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_36', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(48),
    //   rank: new ROE_PE_Dividend_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Dividend_Rank_Month_48', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(48),
    //   rank: new ROE_PE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Rank_Month_48', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(48),
    //   rank: new ROE_PE_Magic_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_Rank_Month_48', start, end)
    // },
    // {
    //   trader: new TraderMonthOverMonth(48),
    //   rank: new ROE_PE_Magic_CheckE_Rank(),
    //   settings: { initcash: init_cash, count: share_count },
    //   recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_Month_48', start, end)
    // },
  ];

  let simulate = new Simulate(step, actions);
  await simulate.run();
  LogWithTime('analysis end');
})();
