import { Rank, ROERank, ROE_PE_Dividend_Rank } from "./rank";
import { Prices } from "./price";
import { Reports } from "./reports";
import { Trader, TraderYearOverYear, Trader2X2, Trader6P1 } from "./trader";
import { Holdings } from "./holding";
import { data } from "./data";
import { Step } from "./step";

export class Simulate {
    //private startDate:Date;
    //private endDate:Date;
    private step:Step;
    private actions:{trader:Trader, rank:Rank}[];
    //private tradeType:TradeType;
    //private rankType:RankType;
    //private trader: Trader;
    //private rank: Rank;

    constructor(//startDate:Date, endDate:Date, 
        step: Step,
        actions: {trader:Trader, rank:Rank}[])
    {
        //this.startDate = startDate;
        //this.endDate = endDate;
        this.step = step;
        this.actions = actions;
        //this.tradeType = tradeType;
        //this.rankType = rankType;
    }

    async run():Promise<void> {
        await data.init();

        //this.trader = this.createTrader();
        //this.rank = this.createRank();
        let prices = new Prices();
        let reports = new Reports();

        let cash = 3000000;
        let holdings: Holdings = {};
        // 可以loadHoldings
        //this.trader.initHoldings(cash, holdings);
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

    /*
    private createTrader():Trader {
        switch (this.tradeType) {
            default: throw new Error(`Trade type ${this.tradeType} not defined`);
            case 'tradeYearOverYear': return new TraderYearOverYear();
            case 'trade2X2': return new Trader2X2();
            case 'trade6P1': return new Trader6P1();
        }
    }

    private createRank():Rank {
        switch (this.rankType) {
            default: throw new Error(`Rank type ${this.rankType} not defined`);
            case 'ROE': return new ROERank();
            case 'ROE_PE_Dividend': return new ROE_PE_Dividend_Rank();
        }
    }
    */
}
