import { Prices } from "../price";
import { Rank } from "../rank";
import { Holdings, Holding, HoldingItem } from "../holding";
import { TradeDay } from "../tradeday";
import { Recorder } from "../recorder";
import { data } from "../data";
import { EmulateTrade } from "../emulatetypes";
import { Reports } from "../reports";

// 检查前一天，是否有应买，有则根据应买买入
// 检查前一天，是否有应卖，有则根据应卖卖出
// 然后check，生成新的应买和应卖
export abstract class Trader {
  initcash: number;
  cash: number;            // 帐上现金
  equity: number;          // 股票净值
  cashCount: number;
  holdings: Holdings;
  shouldSell: Holding[];
  shouldBuy: Holding[];
  
  initHoldings(cash: number, cashCount: number, holdings: Holdings, recorder: Recorder) {
    this.shouldBuy = [];
    this.shouldSell = [];
    this.initcash = cash;
    this.recorder = recorder;
    this.cash = cash;
    this.cashCount = cashCount;
    this.holdings = JSON.parse(JSON.stringify(holdings));
  }


  recorder: Recorder;
  // 根据应买，买入
  // 根据应卖，卖出
  // check之后，会算出应和应买
  async trade(date: TradeDay, prices: Prices, rank: Rank, reports: Reports) {
    await this.updateStockStatus(date, prices);
    await this.internalDailyTrade(date, prices, rank, reports);
    this.calcEquity(prices);
    await this.recordStatus(date);
  }

  protected async updateStockStatus(date: TradeDay, prices: Prices) {
    for (let i in this.holdings) {
      let holding = this.holdings[i];
      let { stockId, list } = holding;
      let price = prices.map[stockId];
      let divRet = await data.getStockDivInfo(stockId, date.day);
      if (divRet !== undefined) {
        let newPrice = price.price;
        let { s, p, price: peiprice, bonus} = divRet;
        for (let v of list) {
          if (bonus > 0) {
            let money = v.volume * bonus / 10;
            let p: EmulateTrade = {
              type: this.recorder.typeID,
              day:date.day,
              stock: stockId,
              tradeType: 10,
              price: bonus / 10,
              volume:v.volume
            }
            await this.recorder.saveTrade(p);
            this.cash += money;
          }
          let oldVolume = v.volume;
          let oldCost = v.buyPrice;
          if (s > 0) {
            let svolume = Math.floor(oldVolume * s / 10);
            let p: EmulateTrade = {
              type: this.recorder.typeID,
              day: date.day,
              stock: stockId,
              tradeType: 3,
              price: newPrice,
              volume:svolume
            }
            await this.recorder.saveTrade(p);
            v.volume = oldVolume + svolume;
            v.buyPrice = oldCost / (1+s);
          }
          if (p > 0) {
            let pvolume = Math.floor(oldVolume * p / 10);
            let adjustVolume = Math.floor((pvolume * peiprice) / newPrice);
            if (adjustVolume < v.volume) {
              let p: EmulateTrade = {
                type: this.recorder.typeID,
                day: date.day,
                stock: stockId,
                tradeType: 4,
                price: newPrice,
                volume:adjustVolume
              }
              await this.recorder.saveTrade(p);
              p.tradeType = 5;
              p.price = peiprice;
              p.volume = pvolume;
              await this.recorder.saveTrade(p);
    
              let cost = v.volume * v.buyPrice;
              v.volume = v.volume + pvolume - adjustVolume;
              v.buyPrice = cost / v.volume;
            }
          }
        }
      }
    }
  }

  protected async internalDailyTrade(date: TradeDay, prices: Prices, rank: Rank, reports: Reports) {
  }

  private calcEquity(prices: Prices) {
    let equity = 0;
    for (let i in this.holdings) {
      let holding = this.holdings[i];
      let { stockId, list } = holding;
      let price = prices.map[stockId].price;
      for (let item of list) {
        let { volume } = item;
        equity += volume * price;
      }
    }
    this.equity = equity;
  }

  protected async checkShouldSell(date: TradeDay, prices: Prices) {
    let i = 0;
    while (i < this.shouldSell.length) {
      let holding = this.shouldSell[i];
      let nprice = prices.map[holding.stockId];
      if (nprice.day < date.day) {
        ++i;
      }
      else {
        await this.sellHolding(holding, date, prices);
        this.shouldSell.splice(i, 1);
      }
    }
  }

  protected async checkShouldBuy(date: TradeDay, prices: Prices) {
    let i = 0;
    while (i < this.shouldBuy.length) {
      let holding = this.shouldBuy[i];
      let count = holding.getTotalCount();
      if (count > this.cashCount) {
        ++i;
        continue;
      }
      let nprice = prices.map[holding.stockId];
      
      if (nprice === undefined || nprice.day < date.day) {
        ++i;
      }
      else {
        await this.buyHolding(holding, date, prices);
        this.shouldBuy.splice(i, 1);
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
    let sellPrice = prices.map[stockId].open;
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
    let buyPrice = prices.map[stockId].open;
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

  protected async buyStock(stockId: number, price: number, num: number, date: TradeDay, level:number=1, count:number=1) {
    let holding = this.holdings[stockId];
    if (holding === undefined) {
      holding = new Holding(stockId);
      this.holdings[stockId] = holding;
    }
    let p: EmulateTrade = {
      type: this.recorder.typeID,
      day: date.day,
      stock: stockId,
      tradeType: 1,
      price: price,
      volume: num
    }
    let money = price * num * 1.001;
    this.cash -= money;
    this.cashCount -= count;
    await this.recorder.saveTrade(p);
    holding.add(date.day, price, num, money, level, count);
  }

  protected async recordStatus(date: TradeDay) {
    let gain = (this.cash + this.equity) / this.initcash;
    await this.recorder.SaveStatus(this.cash, date, this.equity, gain);
    let detail = {
      cash: this.cash,
      equity: this.equity,         // 股票净值
      cashCount: this.cashCount,
      holdings: this.holdings
    }
    let detailStr = JSON.stringify(detail);
    await this.recorder.SaveDetails(date, detailStr);
  }
}
