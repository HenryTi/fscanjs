import { Trader } from './trader'
import { Prices } from "../price";
import { Rank } from "../rank";
import { Holdings, Holding, HoldingItem } from "../holding";
import { EmulateTrade } from "../emulatetypes";
import { TradeDay } from "../tradeday";
import { Reports } from "../reports";

export class TraderReplacePerMonth extends Trader {
  private monthno: number = 0;
  private tradeMonthno: number = -1;
  private intervalCount: number;
  private buyPe:number;
  private sellPe:number;
  private maxShareCount: number;
  private buyCountPerMonth: number;

  constructor (buyPe:number, sellPe:number, intervalCount: number = 1, tradeCount: number = 50) {
    super();
    this.intervalCount = intervalCount;
    this.buyPe = buyPe;
    this.sellPe = sellPe;
    this.maxShareCount = tradeCount;
    this.buyCountPerMonth = Math.round(tradeCount / 12);
  }

  private buyOrder: {stockId:number, order:number}[];
  private sellOrder: {stockId:number, order:number}[];

  protected async internalDailyTrade(date: TradeDay, prices: Prices, rank: Rank, reports: Reports) {
    await this.checkHodingsPE(date, prices);
    let monthno = date.monthno;
    if (monthno === this.monthno || (this.tradeMonthno >= 0 && monthno - this.tradeMonthno < this.intervalCount)) {
      if (this.cashCount <= 0) {
        return;
      }
    }

    await rank.getAt(date, prices, reports);
    this.calculateSellBuyOrder(date, prices, rank);
    await this.checksellOrders(date, prices);
    await this.checkbuyOrders(date, prices);

    this.monthno = monthno;
    this.tradeMonthno = monthno;
  }

  protected calculateSellBuyOrder(date: TradeDay, prices: Prices, rank: Rank) {
    this.buyOrder = [];
    this.sellOrder = [];
    let queue = rank.queue.slice(0, this.maxShareCount);
    for (let i = 0; i < queue.length; ++i) {
      let qi = queue[i];
      let holding = this.holdings[qi.stockId];
      if (holding !== undefined)
        continue;
      if (qi.data.pe >= this.buyPe)
        continue;
      this.buyOrder.push({stockId:qi.stockId, order:qi.num});
      if (this.buyOrder.length >= this.buyCountPerMonth) 
        break;
    }

    let sellCount = this.buyOrder.length + this.cashCount - this.maxShareCount;
    if (this.buyOrder.length > 0 && sellCount > 0) {
      let tmpsellOrder: {stockId:number, order:number}[] = [];
      let keys = Object.keys(this.holdings);
      for (let i of keys) {
        let holding = this.holdings[i];
        let stockId = holding.stockId as number;
        let o = rank.getOrder(stockId);
        if (o < 0) {
          let p = prices.map[stockId];
          if (p !== undefined && p.day === date.day) {
            o = 2000;
          }
        }
        if (o > 0) {
          let j = 0;
          for (; j < tmpsellOrder.length; ++j) {
            let sitem = tmpsellOrder[i] as {stockId:number, order:number};
            if (o < sitem.order) {
              break;
            }
          }
          tmpsellOrder.splice(j, 0, {stockId:stockId, order:o});
        }
      }
      tmpsellOrder = tmpsellOrder.slice(0, sellCount);

      let maxBuyOrder = this.buyOrder[this.buyOrder.length -1].order + this.maxShareCount;
      for (let bitem of tmpsellOrder) {
        if (bitem.order >= maxBuyOrder) {
          this.sellOrder.push(bitem);
        }
      }
    }
  }

  protected async checksellOrders(date: TradeDay, prices: Prices) {
    for (let item of this.sellOrder) {
      let holding = this.holdings[item.stockId];
      await this.sellHolding(holding, date, prices);
    }
  }

  protected async checkbuyOrders(date: TradeDay, prices: Prices) {
    for (let v of this.buyOrder) {
      let buyItem = new Holding(v.stockId);
      buyItem.add(date.day, prices.map[v.stockId].price, 0, 0);
      await this.buyHolding(buyItem, date, prices);
    }
  }

  protected async checkHodingsPE(date: TradeDay, prices: Prices) {
    let keys = Object.keys(this.holdings);
    for (let i of keys) {
      let holding = this.holdings[i];
      let daype = await prices.getPe(holding.stockId, date.day);
      let pe = daype.pe;
      if (pe !== undefined && pe >= this.sellPe) {
        await this.sellHolding(holding, date, prices);
        delete this.holdings[i];
      }
    }
  }

  protected async sellHolding(holding: Holding, date: TradeDay, prices: Prices) {
    let { stockId, list } = holding;
    for (let item of list) {
      await this.sellHoldingItem(stockId, item, date, prices);
    }
  }

  protected async sellHoldingItem(stockId: number, holdingItem: HoldingItem, date: TradeDay, prices: Prices) {
    let sellPrice = prices.map[stockId].price;
    let money = sellPrice * holdingItem.volume * 0.999;
    this.cash += money;
    this.cashCount += holdingItem.count;
    let p: EmulateTrade = {
      type: this.recorder.typeID,
      day: date.day,
      stock: stockId,
      tradeType: 2,
      price: sellPrice,
      volume:holdingItem.volume
    }
    await this.recorder.saveTrade(p);
  }

  protected async buyHolding(holding: Holding, date: TradeDay, prices: Prices) {
    if (this.cashCount <= 0)
      return;
    let { stockId, list } = holding;
    let buyPrice = prices.map[stockId].price;
    let money = this.cash / this.cashCount;
    for (let item of list) {
      if (this.cashCount < item.count)
        continue;
      let volume = Math.floor(money * 0.999 * item.count / buyPrice / 100) * 100;
      if (volume > 0) {
        await this.buyStock(stockId, buyPrice, volume, date, item.level, item.count)
      }
    }
  }
}

