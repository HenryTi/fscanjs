export interface HoldingItem {
  buyDate: number;
  buyPrice: number;
  volume: number;
  amount: number;
  level: number;
  count: number;
}

export class Holding {
  readonly stockId: number;
  readonly list: HoldingItem[];

  constructor(stockId: number) {
    this.stockId = stockId;
    this.list = [];
  }

  add(buyDate: number, buyPrice: number, volume: number, amount: number, level:number=1, count:number=1) {
    this.list.push({
      buyDate: buyDate,
      buyPrice: buyPrice,
      volume: volume,
      amount: amount,
      level: level,
      count: count
    });
  }

  remove(buyDate: number, level: number) {
    let index = this.list.findIndex(v => v.buyDate === buyDate && v.level === level);
    if (index >= 0) this.list.splice(index, 1);
  }

  getTotalCount() {
    let count = 0;
    for (let item of this.list) {
      count += item.count;
    }

    return count;
  }
}

export interface Holdings {
  [id: number]: Holding;
}
