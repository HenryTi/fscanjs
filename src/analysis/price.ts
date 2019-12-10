import { data } from "./data";
import { TradeDay } from "./tradeday";

export class Price {
  day: number;
  price: number;
  open: number;
}

export class PeAtDay {
  day: number;
  pe: number;
}

export class Prices {
  day: number;
  map: { [id: number]: Price } = {};
  count: number;
  pemap: { [id: number]: PeAtDay } = {};

  async load(tradeDay: TradeDay): Promise<void> {
    let { day } = tradeDay;
    this.day = day;
    let arr = await data.getPricesFromDay(day);
    this.count = arr.length;
    for (let item of arr) {
      let { id, price, open } = item;
      this.map[id] = { day: day, price: price, open: open };
    }
  }

  async getPe(stockId: number, day: number) {
    let item = this.pemap[stockId];
    if (item !== undefined && item.day === day) {
      return item;
    }
    else {
      let r = await data.getPeAtDay(stockId, day);
      if (r.length <= 0) {
        item = {day: day, pe:undefined};
      }
      else {
        item = {day: day, pe:r[0].pe};
      }
      this.pemap[stockId] = item;
      return item;
    }
  }
}
