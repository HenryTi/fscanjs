import { TradeDay, tradeDayToNext } from "./tradeday";

export class Step {
  protected start: TradeDay;
  protected end: TradeDay;
  protected current: TradeDay;

  constructor(start: TradeDay, end: TradeDay) {
    this.start = start;
    this.end = end;
    this.current = this.start;
    this.current.isNewMonth = true;
    this.current.isNewYear = true;
  }

  get first(): TradeDay {
    return this.current;
  }

  get next(): TradeDay {
    let nd = tradeDayToNext(this.current);
    nd.isNewMonth = nd.monthno != this.current.monthno;
    nd.isNewYear = nd.year != this.current.year;
    return this.current = nd;
  }

  get isGoing(): boolean {
    return this.current.day < this.end.day;
  }
}
