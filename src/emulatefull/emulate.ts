import * as _ from 'lodash';
import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun, LogWithTime } from '../gfuncs';
import { Const_dbname } from '../const';
import { TradeDay, initTradeDay, getTradeDayAt, getNextTradeDay, getLastTradeDay } from "./tradeday";
import { EmulateTrade, EmulateResult, EmulateShare, EmulateStockResultItem, SelectStockResultItem, EmulateDetail, EmulateShareItem } from './emulatetypes';
import { updateStockStatus } from './updateStockStatus';
import { checkSell } from './checkSell';
import { checkOld } from './checkOld';
import { checkBuyNew } from './checkBuyNew';

const cont_amountInit = 3000000;
const const_EmulatePlanName = 'full-pe11';
const const_weekMaxChangeCount = 3;
const const_pe = 11;

export async function emulateTradeFull(yearBegin:number, monthBegin:number, yearEnd:number, monthEnd:number) {
  if (RemoteIsRun())
    return;
  RemoteRun(true);

  LogWithTime('emulateTrade61 begin');
  try {
    let runner: Runner = await getRunner(Const_dbname);

    let param = { yearBegin: yearBegin, monthBegin: monthBegin, yearEnd: yearEnd, monthEnd: monthEnd };
    let em = new EmulateTrades(runner);
    await em.processOne(param);
  }
  catch (err) {
    console.log(err);
  }
  LogWithTime('emulateTrade61 end');
  RemoteRun(false);
}

function dayFromYearMonth(year: number, month: number) {
  return year * 10000 + month * 100 + 1;
}

export class EmulateTrades {
  runner: Runner;
  typeID: number;
  typeBeginDay: number;
  typeEndDay: number;
  emuDetails: EmulateDetail;
  emuResult: EmulateResult;
  amountInit: number;

  protected monthNo: number;
  protected weekNo: number;
  weekChangeCount: number;
  maxWeekChangeCount: number = const_weekMaxChangeCount;
  lastTradeDay: TradeDay;
  currentTradeDay: TradeDay;

  constructor(runner: Runner) {
    this.runner = runner;
    this.weekChangeCount = 0;
    this.weekNo = 0;
    this.monthNo = 0;
    this.amountInit = cont_amountInit;
  }

  private async initTypeID(dayBegin: number, dayEnd: number): Promise<any> {
    let qr = await this.runner.query('tv_emulatetype$getid', [const_EmulatePlanName, dayBegin, dayEnd]);
    let arr = qr as any[];
    if (arr.length > 0) {
      let r = arr[0];
      this.typeID = r.id;
      this.typeBeginDay = dayBegin;
      this.typeEndDay = dayEnd;
      return r;
    }

    qr = await this.runner.call('tv_emulateType$save', [undefined, const_EmulatePlanName, dayBegin, dayEnd]);
    arr = qr as any[];
    if (arr.length <= 0) {
      return undefined;
    }
    let id = arr[0].id as number;
    if (id === undefined || id <= 0)
      return undefined;
    let ret = { id: id, name: const_EmulatePlanName, begin: dayBegin};
    this.typeID = id;
    this.typeBeginDay = dayBegin;
    this.typeEndDay = dayEnd;
    return ret;
  }

  async processOne(p: { yearBegin: number, monthBegin: number, yearEnd: number, monthEnd: number }): Promise<any> {
    try {
      let dayBegin = dayFromYearMonth(p.yearBegin, p.monthBegin);
      let dayEnd = dayFromYearMonth(p.yearEnd, p.monthEnd);
      let type = await this.initTypeID(dayBegin, dayEnd);
      if (type === undefined)
        throw 'cant get emulatetypeid :' + p;
      await initTradeDay(this.runner, dayFromYearMonth(p.yearBegin - 1, 12), dayEnd);
      await this.runner.call('tv_emulatetype$deletedata', [this.typeID]);
      await this.CalculateFirst();
      
      let tradeDay = getTradeDayAt(dayBegin);
      while (tradeDay !== undefined) {
        if (tradeDay.day >= dayEnd)
          break;
        this.currentTradeDay = tradeDay;
        this.checkNewWeek(tradeDay);
        await this.CalculateNextDay();
        this.lastTradeDay = tradeDay;
        tradeDay = getNextTradeDay(tradeDay.day);
      }

      console.log('emulate, type=' + type + ',  ' + p.yearBegin + ' - ' + p.monthBegin);
    }
    catch (err) {
      console.log(err);
    }
  }

  peList: any[];

  sellCount: number = 0;
  buyCount: number = 0;

  protected async CalculateNextDay() {
    this.sellCount = 0;
    this.buyCount = 0;
    this.peList = await this.loadNewPE();
    await this.loadStocksOrder();
    await updateStockStatus(this);
    await this.checkSell();
    await this.checkBuyNew();
    await this.checkChange();
    
    await this.updateLastStatus();
  }

  protected checkNewWeek(tradeDay : TradeDay) {
    let weekNo = Math.floor((tradeDay.day % 100) / 3);
    if (weekNo > 2)
      weekNo = 2;
    if (tradeDay.monthno === this.monthNo && weekNo === this.weekNo) {
      return;
    }
    this.monthNo = tradeDay.monthno;
    this.weekNo = weekNo;
    this.weekChangeCount = 0;
  }

  protected async CalculateFirst() {
    let details : EmulateDetail = {
      moneyinit: this.amountInit,
      money: this.amountInit,
      moneyCount: 50,
      shareCount: 0,
      shares: []
    }

    this.emuDetails = details;
    this.emuResult = { type: this.typeID, day: this.typeBeginDay, money: this.amountInit, share: 0, gain: 1 };
    await this.SaveCurrentStatus();
    await this.SaveCurrentDetail(this.typeBeginDay);
  }

  async AddNewStock(stock:number, volume:number, price:number, count:number=1,level:number=1):Promise<boolean> {
    let share:EmulateShare = {
      stock: stock,
      count: count,
      items: [
        {
          buyDay: this.currentTradeDay.day,
          count: count,
          level: level,
          volume: volume,
          costprice: price,
          price: price
        }
      ]
    }
    await this.buyShareItem(stock, share.items[0]);

    this.emuDetails.shares.push(share);
    return true;
  }

  async sellShareItem(stock: number, item: EmulateShareItem) {
    let money = item.volume * item.price * 0.998;
    let p: EmulateTrade = {
      type: this.typeID,
      day:this.currentTradeDay.day,
      stock: stock,
      tradeType: 2,
      price: item.price,
      volume: item.volume
    }
    await this.SaveTrade(p);
    this.emuDetails.moneyCount += item.count;
    this.emuDetails.shareCount -= item.count;
    this.emuDetails.money += money;
  }

  async buyShareItem(stock: number, item: EmulateShareItem) {
    let money = item.volume * item.price * 1.002;
    let p: EmulateTrade = {
      type: this.typeID,
      day:this.currentTradeDay.day,
      stock: stock,
      tradeType: 1,
      price: item.price,
      volume: item.volume
    }
    await this.SaveTrade(p);
    this.emuDetails.moneyCount -= item.count;
    this.emuDetails.shareCount += item.count;
    this.emuDetails.money -= money;
  }

  async updateLastStatus() {
    this.emuResult.money = this.emuDetails.money;
    let shareSum = 0;
    this.emuDetails.shares.forEach(si=>{
      si.items.forEach(v => {
        shareSum += v.volume * v.price;
      })
    })
    this.emuResult.share = shareSum;
    this.emuResult.gain = (this.emuResult.share + this.emuResult.money) / this.emuDetails.moneyinit;
    this.emuResult.day = this.currentTradeDay.day;
    await this.SaveCurrentStatus();
    await this.SaveCurrentDetail(this.currentTradeDay.day);
  }
 
  async SaveCurrentStatus() {
    await this.runner.call('tv_emulateresult$save', [this.emuResult.type, Math.floor(this.emuResult.day / 100), this.emuResult.money, this.emuResult.share, this.emuResult.gain]);
  }

  async SaveCurrentDetail(day:number) {
    await this.runner.call('tv_emulateshares$save', [this.typeID, day, JSON.stringify(this.emuDetails)]);
  }

  async SaveTrade(p: EmulateTrade) {
    await this.runner.call('tv_emulatetrade$add', [p.type, p.day, p.stock, p.tradeType, p.price, p.volume]);
  }

  async GetStockNextPrice(stock: number, day: number) {
    let ret = await this.runner.query('tv_getstockpriceafterday', [stock, day]);
    if (ret.length <= 0)
      return undefined;
    let item: { price: number, day: number } = ret[0];
    return { price: item.price, day: item.day };
  }

  async GetStockLastPrice(stock: number, day: number) {
    let ret = await this.runner.query('tv_getstocklastprice', [stock, day]);
    if (ret.length <= 0)
      return undefined;
    let item: { price: number, day: number } = ret[0];
    return { price: item.price, day: item.day };
  }

  addBouns(money: number) {
    this.emuDetails.money += money;
  }

  async removeStock(stock:number) {
    let i = 0;
    while (i < this.emuDetails.shares.length) {
      let share = this.emuDetails.shares[i];
      if (share.stock === stock) {
        for (let k = 0; k < share.items.length; ++k) {
          await this.sellShareItem(share.stock, share.items[k]);
          this.sellCount++;
        }
        this.emuDetails.shares.splice(i, 1);
        return;
      }
      ++i;
    }
  }

  protected async loadNewPE() {
    let shares = this.emuDetails.shares;
    let pes = [];
    for (let i = 0; i < shares.length; ++i) {
      let stock = shares[i].stock;
      let r = await this.runner.call('q_getstockpeatday', [stock, this.currentTradeDay.day]);
      if (r.length <= 0) {
        pes.push({stock: stock, pe:undefined});
      }
      else {
        pes.push({stock:stock, pe:r[0].pe});
      }
    }

    return pes;
  }

  stockOrder: any[];
  pechecked: boolean = true;
  protected async loadStocksOrder() {
    let lastDay = getLastTradeDay(this.currentTradeDay.day);
    this.stockOrder = await this.runner.call('tv_calcmagicorderdpr', [lastDay, 500]);
    let sum = 0;
    for (let i = 0; i < 50; ++i) {
      sum += this.stockOrder[i].pe;
    }
    let peAvg = sum / 50;
    this.pechecked = peAvg < 25;
  }

  protected async checkSell() {
    let shares = this.emuDetails.shares;
    let sellAllStocks = [];
    let i = 0;
    for (; i < shares.length; ++i) {
      let si = shares[i];
      let index = this.peList.findIndex(v=>v.stock===si.stock);
      let pe: number = undefined;
      if (index >= 0)
        pe = this.peList[index].pe;
      if (pe < 0 || pe >= 30 && si.count <= 1) {
        let item = si.items[0];
        //if (item.price >= item.costprice) {
        sellAllStocks.push(si.stock);
        //}
      }
    }
    
    for (i = 0; i < sellAllStocks.length; ++i) {
      await this.removeStock(sellAllStocks[i]);
    }
  }

  async checkBuyNew() {
    if (this.emuDetails.moneyCount <= 0 || !this.pechecked)
      return;
    
    let end = this.stockOrder.length as number;
    if (end > 150)
      end = 150;
    let i = 0;
    for (; i < end; ++i) {
      let item = this.stockOrder[i] as {stock: number, pe: number};
      if (item.pe > const_pe)
        continue;
      let fi = this.emuDetails.shares.findIndex(v=>v.stock === item.stock);
      if (fi >= 0) {
        continue;
      }
      let retPrice = await this.runner.call('tv_getstockpriceatday', [item.stock, this.currentTradeDay.day]) as any[];
      if (retPrice.length <= 0)
        continue;
      let price = retPrice[0].price;
      let money = this.emuDetails.money / this.emuDetails.moneyCount;
      let volume = Math.floor((money / (price*1.002)) / 100) * 100;
      if (volume <= 0)
        continue;
      let r = await this.AddNewStock(item.stock, volume, price);
      this.buyCount++;
      if (this.emuDetails.moneyCount <= 0)
        break;
    }
  }

  async checkChange() {
    if (this.emuDetails.moneyCount > 0 || this.buyCount > 0 || this.weekChangeCount >= this.maxWeekChangeCount)
      return;
  }
}
