import { Rank } from "./rank";
import { Prices } from "./price";
import { Reports } from "./reports";
import { Trader } from "./trader";
import { Holdings } from "./holding";
import { data } from "./data";
import { Step } from "./step";
import { Recorder } from "./recorder";
import { Settings } from "./settings"

export class Simulate {
  private step: Step;
  private actions: { trader: Trader, rank: Rank, settings: Settings, recorder: Recorder }[];

  constructor(
    step: Step,
    actions: { trader: Trader, rank: Rank, settings: Settings, recorder: Recorder }[]) {
    this.step = step;
    this.actions = actions;
  }

  async run(): Promise<void> {
    await data.init();

    let prices = new Prices();
    let reports = new Reports();

    let holdings: Holdings = {};
    for (let action of this.actions) {
      await action.recorder.init();
      let { initcash, count } = action.settings;
      action.trader.initHoldings(initcash, count, holdings, action.recorder);
    }

    for (let date = this.step.first; this.step.isGoing; date = this.step.next) {
      await prices.load(date);
      if (prices.count <= 0) continue;

      await reports.load(date);
      for (let action of this.actions) {
        let { trader, rank, recorder } = action;
        await rank.sort(date, prices, reports);
        await trader.trade(date, prices, rank);
      }
    }
  }
}
