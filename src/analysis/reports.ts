import { Stock } from "./stock";
import { TradeDay } from "./tradeday";

export class Report {
  readonly stockId: number;
  readonly date: number;
  profit: number;
  netAssets: number;
  dividend: number;
  sumShares: number;
}

export class Reports {
  date: TradeDay;
  map: { [id: number]: Report } = {};

  async load(date: TradeDay): Promise<void> {
    if (this.date !== undefined && date.day === this.date.day)
      return;
    this.date = date;
    this.map = {};
    //throw new Error('implementing!');
  }
}
