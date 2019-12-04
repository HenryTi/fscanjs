import { Estimates } from "../estimate";
import { Prices } from "../price";
import { Reports } from "../reports";
import { TradeDay } from "../tradeday";

export class Point {
  readonly stockId: number;
  num: number;
  data?: any;
  constructor(stockId: number) {
    this.stockId = stockId;
  }
}

export abstract class Rank {
  date: TradeDay;
  protected prices: Prices;
  protected reports: Reports;
  readonly estimates: Estimates;
  readonly queue: Point[] = [];
  protected map: {[id:number]: Point};

  async sort(date: TradeDay, prices: Prices, reports: Reports) {
    if (this.date !== undefined && this.date.day === date.day)
      return;
    this.date = date;
    this.prices = prices;
    this.reports = reports;
    await this.internalSort();
  }

  protected async internalSort() {

  }
}









