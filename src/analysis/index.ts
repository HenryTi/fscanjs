import { Simulate } from "./simulate";
import { Step } from "./step";
import { TraderYearOverYear, TraderPartOfYear, TraderSeasonOverSeason, TraderMonthOverMonth, Trader, TraderReplacePerMonth } from "./trader";
import { ROERank, ROE_PE_Dividend_Rank, ROE_PE_Magic_Rank, ROE_PE_Magic_CheckE_Rank, ROE_PE_Rank } from "./rank";
import { TradeDay, getNextTradeDay, getLastTradeDay, initTradeDay } from "./tradeday";
import { Recorder } from "./recorder";
import { Settings } from "./settings";
import { data } from "./data";
import { LogWithTime } from "../gfuncs";

const init_cash: number = 3000000;
const share_count: number = 50;
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);

(async function () {
  LogWithTime('analysis begin');
  await data.init();
  await initTradeDay(20001201, 20191201);
  let start = getNextTradeDay(20010101);
  //let start = getNextTradeDay(20100101);
    //LogWithTime('analysis begin ' + sday);
    //let start = getNextTradeDay(sday);
  //let end = getLastTradeDay(20190101);
  let end = getLastTradeDay(20191101);
  let step = new Step(start, end);
  let actions = [
    {
      trader: new TraderReplacePerMonth(11, 25, 1, share_count),
      rank: new ROE_PE_Dividend_Rank(),
      settings: { initcash: init_cash, count: share_count },
      recorder: new Recorder('ROE_PE_Dividend_Rank_ReplaceMonth1', start, end)
    },
    {
      trader: new TraderReplacePerMonth(11, 25, 1, share_count),
      rank: new ROE_PE_Rank(),
      settings: { initcash: init_cash, count: share_count },
      recorder: new Recorder('ROE_PE_Rank_ReplaceMonth1', start, end)
    },
    {
      trader: new TraderReplacePerMonth(11, 25, 1, share_count),
      rank: new ROE_PE_Magic_Rank(),
      settings: { initcash: init_cash, count: share_count },
      recorder: new Recorder('ROE_PE_Magic_Rank_ReplaceMonth1', start, end)
    },
    {
      trader: new TraderReplacePerMonth(11, 25, 1, share_count),
      rank: new ROE_PE_Magic_CheckE_Rank(),
      settings: { initcash: init_cash, count: share_count },
      recorder: new Recorder('ROE_PE_Magic_CheckE_Rank_ReplaceMonth1', start, end)
    },
  ];

  let simulate = new Simulate(step, actions);
  await simulate.run();
  //LogWithTime('analysis end ' + sday);

LogWithTime('analysis end');
})();
