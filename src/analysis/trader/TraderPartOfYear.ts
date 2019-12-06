import { Trader } from './trader'
import { Prices } from "../price";
import { Rank } from "../rank";
import { Holdings, Holding, HoldingItem } from "../holding";
import { TradeDay } from "../tradeday";
import { Reports } from "../reports";

export class TraderPartOfYear extends Trader {
  private monthno: number = 0;
  private begin: number;
  private end: number;

  constructor (begin: number, end: number) {
    super();
    this.begin = begin;
    this.end = end;
  }

  protected async internalDailyTrade(date: TradeDay, prices: Prices, rank: Rank, reports: Reports) {
    let monthno = date.monthno;
    if (monthno === this.monthno) {
      await this.checkShouldSell(date, prices);
      await this.checkShouldBuy(date, prices);
      return;
    }
    this.monthno = monthno;
    let month = Math.floor((date.day % 10000) / 100);

    if (month === this.begin) {
      await this.checkShouldSell(date, prices);
      await rank.sort(date, prices, reports);
      let points = rank.queue.slice(0, 50);
      points.map(v => {
        let buyItem = new Holding(v.stockId);
        buyItem.add(date.day, prices.map[v.stockId].price, 0, 0);
        this.shouldBuy.push(buyItem)
      });
    }
    else if (month === this.end) {
      this.sellHoldings(date, prices);
      await this.checkShouldSell(date, prices);
    }
    else {
      await this.checkShouldSell(date, prices);
      await this.checkShouldBuy(date, prices);
    }
  }

  private sellHoldings(date: TradeDay, prices: Prices) {
    let keys = Object.keys(this.holdings);
    for (let i of keys) {
      let holding = this.holdings[i];
      this.shouldSell.push(holding);
      delete this.holdings[i];
    }
  }
}

