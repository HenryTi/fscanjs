import { data } from "./data";
import { TradeDay } from "./tradeday";
import { EmulateTrade, EmulateResult, EmulateStockResultItem, SelectStockResultItem, EmulateDetail } from './emulatetypes';
import { HoldingItem, Holdings, Holding } from "./holding"

export class Recorder {
  private name:string;
  private dayBegin: TradeDay;
  private dayEnd: TradeDay;
  typeID: number;
  private trades: EmulateTrade[] = [];
  private status: { [index:number]:{money:number, share:number, gain: number} } = {};
  private laststatus: { gain: number } = { gain: 1 };
  private details: { day:number, detail: string }[] = [];


  constructor(name:string, dayBegin:TradeDay, dayEnd:TradeDay) {
    this.name = name;
    this.dayBegin = dayBegin;
    this.dayEnd = dayEnd;
  }

  async init() {
    this.typeID = await data.initTypeID(this.name, this.dayBegin.day, this.dayEnd.day);
  }

  async saveTrade(p: EmulateTrade) {
    this.trades.push(p);
  }

  async SaveStatus(money: number, date:TradeDay, share: number, gain: number) {
    this.laststatus.gain = gain;
    let dayIndex = Math.floor(date.day / 100);
    this.status[dayIndex] = {money:money, share:share, gain:gain};
  }

  async SaveDetails(date:TradeDay, detail: string) {
    this.details.push({day:date.day, detail:detail});
  }

  async flush() {
    await data.SaveLastStatus(this.typeID, this.laststatus.gain);
    for (let p of this.trades) {
      await data.SaveTrade(p);
    }

    let keys = Object.keys(this.status);
    for (let dayIndex of keys) {
      let item = this.status[dayIndex];
      let {money, share, gain} = item;
      let day:number = parseInt(dayIndex);
      await data.SaveStatus(this.typeID, day, money, share, gain);
    }

    for (let dItem of this.details) {
      await data.SaveDetail(this.typeID, dItem.day, dItem.detail);
    }
  }
}