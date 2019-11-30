import { Prices } from "./price";
import { Rank } from "./rank";
import { Holdings, Holding } from "./holding";
import { Stock } from "./stock";

// 检查前一天，是否有应买，有则根据应买买入
// 检查前一天，是否有应卖，有则根据应卖卖出
// 然后check，生成新的应买和应卖
export abstract class Trader {
    cash:number;            // 帐上现金
    equity:number;          // 股票净值
    holdings:Holdings;
    shouldSell: Holdings;
    shouldBuy: Holding[];

    initHoldings(cash:number, holdings:Holdings) {
        this.cash = cash;
        this.holdings = holdings;
    }

    // 根据应买，买入
    // 根据应卖，卖出
    // check之后，会算出应和应买
    dailyTrade(date:Date, prices:Prices, rank:Rank): void {
        this.calcEquity(prices);
        this.internalDailyTrade(date, prices, rank);
    }
    
    protected internalDailyTrade(date:Date, prices:Prices, rank:Rank): void {
    }

    private calcEquity(prices:Prices):void {
        let equity = 0;
        for (let i in this.holdings) {
            let holding = this.holdings[i];
            let {stockId, numShares} = holding;
            let price = prices.map[stockId].close;
            equity += numShares * price;
        }
        this.equity = equity;
    }

    protected sellHolding(holding: Holding) {
    }

    protected buyStock(stockId:number, price:number, num:number) {        
    }
}

export class Trader6P1 extends Trader {

}

export class Trader2X2 extends Trader {

}

export class TraderYearOverYear extends Trader {
    private year: number = 0;

    protected internalDailyTrade(date:Date, prices:Prices, rank:Rank): void {
        let year = date.getFullYear();
        if (year === this.year) return;
        this.year = year;

        this.sellHoldings();

        let points = rank.queue.slice(0, 50);
        this.buyStocks(points.map(v => v.stockId));
    }

    private sellHoldings() {
        let keys = Object.keys(this.holdings);
        for (let i in keys) {
            let holding = this.holdings[i];
            this.sellHolding(holding);
            this.holdings[i] = undefined;
        }
    }

    private buyStocks(stockIds: number[]) {

    }
}

