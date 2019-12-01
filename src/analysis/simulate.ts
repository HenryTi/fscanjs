import { Rank } from "./rank";
import { Prices } from "./price";
import { Reports } from "./reports";
import { Trader } from "./trader";
import { Holdings } from "./holding";
import { data } from "./data";
import { Step } from "./step";

export class Simulate {
    private step:Step;
    private actions:{trader:Trader, rank:Rank}[];

    constructor(
        step: Step,
        actions: {trader:Trader, rank:Rank}[])
    {
        this.step = step;
        this.actions = actions;
    }

    async run():Promise<void> {
        await data.init();

        let prices = new Prices();
        let reports = new Reports();

        let cash = 3000000;
        let holdings: Holdings = {};
        for (let action of this.actions) {
            action.trader.initHoldings(cash, holdings);
        }

        for (let date=this.step.first; this.step.isGoing; date=this.step.next)
        {
            await prices.load(date);
            console.log(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}: ${prices.count}`);
            if (prices.count <= 0) continue;

            await reports.load(date);
            for (let action of this.actions) {
                let {trader, rank} = action;
                rank.sort(date, prices, reports);
                trader.trade(date, prices, rank);
            }
        }
    }
}
