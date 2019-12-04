import { data } from "./data";
import { TradeDay } from "./tradeday";
import { EmulateTrade, EmulateResult, EmulateStockResultItem, SelectStockResultItem, EmulateDetail } from './emulatetypes';
import { HoldingItem, Holdings, Holding } from "./holding"

export class Recorder {
  private name:string;
  private dayBegin: TradeDay;
  private dayEnd: TradeDay;
  typeID: number;

  constructor(name:string, dayBegin:TradeDay, dayEnd:TradeDay) {
    this.name = name;
    this.dayBegin = dayBegin;
    this.dayEnd = dayEnd;
  }

  async init() {
    this.typeID = await data.initTypeID(this.name, this.dayBegin.day, this.dayEnd.day);
  }

  async saveTrade(p: EmulateTrade) {
    await data.SaveTrade(p);
  }

  async SaveStatus(money: number, date:TradeDay, share: number, gain: number) {
    await data.SaveStatus(this.typeID, Math.floor(date.day / 100), money, share, gain);
  }

  async SaveDetails(date:TradeDay, detail: string) {
    await data.SaveDetail(this.typeID, date.day, detail);
  }
}