import { Trader } from './trader'
import { Prices } from "../price";
import { Rank } from "../rank";
import { Holdings, Holding, HoldingItem } from "../holding";
import { TradeDay } from "../tradeday";
import { Reports } from "../reports";

export class TraderMonthOverMonth extends Trader {
  private month: number = 0;

  protected async internalDailyTrade(date: TradeDay, prices: Prices, rank: Rank, reports: Reports) {
    let month = date.monthno;
    if (month === this.month) {
      await this.checkShouldSell(date, prices);
      await this.checkShouldBuy(date, prices);
      return;
    }
    this.month = month;

    await rank.sort(date, prices, reports);

    this.sellHoldings(date, prices);
    await this.checkShouldSell(date, prices);

    let points = rank.queue.slice(0, 50);
    points.map(v => {
      let buyItem = new Holding(v.stockId);
      buyItem.add(date.day, prices.map[v.stockId].price, 0, 0);
      this.shouldBuy.push(buyItem)
    }
    );
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

