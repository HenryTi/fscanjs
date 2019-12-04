import { Estimates } from "./estimate";
import { Prices } from "./price";
import { Reports } from "./reports";
import { TradeDay } from "./tradeday";
import { data } from "./data";

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

export class ROERank extends Rank {
  protected async internalSort() {

  }
}

export class PERank extends Rank {
  protected async internalSort() {

  }
}

export class DividendRank extends Rank {
  protected async internalSort() {

  }
}

export class ROE_PE_Magic_Rank extends Rank {
  protected async internalSort() {
    this.queue.splice(0);
    this.map = [];
    let ret = await data.LoadROE_PE_Magic_Rank(this.date.day, 1000);
    for (let i = 0; i < ret.length; ++i) {
      let item = ret[i];
      let point: Point = new Point(item.stock);
      point.num = item.no;
      point.data = item;
      this.queue.push(point);
      this.map[item.stock] = point;
    }
  }
}

export class ROE_PE_Magic_CheckE_Rank extends Rank {
  protected async internalSort() {
    this.queue.splice(0);
    this.map = [];
    let ret = await data.LoadROE_PE_Magic_CheckE_Rank(this.date.day, 1000);
    for (let i = 0; i < ret.length; ++i) {
      let item = ret[i];
      let point: Point = new Point(item.stock);
      point.num = item.no;
      point.data = item;
      this.queue.push(point);
      this.map[item.stock] = point;
    }
  }
}

export class ROE_PE_Dividend_Rank extends Rank {
  protected async internalSort() {
    this.queue.splice(0);
    this.map = [];
    let ret = await data.LoadROE_PE_Dividend_Rank(this.date.day, 1000);
    for (let i = 0; i < ret.length; ++i) {
      let item = ret[i];
      let point: Point = new Point(item.stock);
      point.num = item.no;
      point.data = item;
      this.queue.push(point);
      this.map[item.stock] = point;
    }
  }
}
