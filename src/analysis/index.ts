import { Simulate } from "./simulate";
import { Step } from "./step";
import { TraderYearOverYear } from "./trader";
import { ROERank, ROE_PE_Dividend_Rank } from "./rank";
import { TradeDay, getNextTradeDay, getLastTradeDay, initTradeDay } from "./tradeday";
import { Recorder } from "./recorder";
import { Settings } from "./settings";
import { data } from "./data";

(async function () {
  await data.init();
  await initTradeDay(20091201, 20191201);
  let start = getNextTradeDay(20100101);
  let end = getLastTradeDay(20190101);
  let step = new Step(start, end);
  let actions = [
    {
      trader: new TraderYearOverYear(),
      rank: new ROE_PE_Dividend_Rank(),
      settings: { initcash: 3000000, count: 50 },
      recorder: new Recorder('ROE_PE_Dividend_Rank_YearOverYear', start, end)
    }
  ];

  let simulate = new Simulate(step, actions);
  await simulate.run();
})();
