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
  protected topPEavg: number;

  get topPE() {
    return this.topPEavg;
  }

  getOrder(stockId:number) {
    let item = this.map[stockId];
    if (item === undefined)
      return -1;
    return item.num;
  }

  async getAt(date: TradeDay, prices: Prices, reports: Reports) {
    if (this.date !== undefined && this.date.day === date.day)
      return;
    this.date = date;
    this.prices = prices;
    this.reports = reports;
    await this.internalSort();
    this.calculateAVG();
  }

  protected async internalSort() {

  }

  protected calculateAVG() {
    let points = this.queue.slice(0, 50);
    let count = 0;
    let sum = 0;
    for (let item of points) {
      let data = item.data;
      if (data !== undefined) {
        sum += data.pe;
        ++count;
      }
    }

    if (count <= 0) {
      this.topPEavg = 0;
    }
    else {
      this.topPEavg = sum / count;
    }
  }
}









