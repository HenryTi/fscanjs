import { Rank, ROERank, ROE_PE_Dividend_Rank } from "./rank";
import { Prices } from "./price";
import { Reports } from "./reports";
import { Trader, TraderYearOverYear, Trader2X2, Trader6P1 } from "./trader";
import { Holdings } from "./holding";
import { data } from "./data";

type TradeType = 'tradeYearOverYear' | 'trade2X2' | 'trade6P1';
type RankType = 'ROE' | 'ROE_PE_Dividend';

export class Simulate {
    private startDate:Date;
    private endDate:Date;
    private tradeType:TradeType;
    private rankType:RankType;
    private trader: Trader;
    private rank: Rank;

    constructor(startDate:Date, endDate:Date, tradeType:TradeType, rankType:RankType) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.tradeType = tradeType;
        this.rankType = rankType;
    }

    async run():Promise<void> {
        await data.init();

        this.trader = this.createTrader();
        this.rank = this.createRank();
        let prices = new Prices();
        let reports = new Reports();

        let cash = 3000000;
        let holdings: Holdings = {};
        // 可以loadHoldings
        this.trader.initHoldings(cash, holdings);

        for (let date=this.startDate; 
            date<this.endDate;
            date=new Date(date.setDate(date.getDate()+1)))
        {
            await prices.load(date);
            console.log(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}: ${prices.count}`);
            if (prices.count <= 0) continue;

            await reports.load(date);
            this.rank.sort(date, prices, reports);
            this.trader.dailyTrade(date, prices, this.rank);
        }
    }

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
}
