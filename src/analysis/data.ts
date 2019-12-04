import { Runner, getRunner } from "../db";
import { Const_dbname } from "../const";
import { EmulateTrade } from "./emulatetypes";

function getDayNum(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + (date.getDate());
}

class Data {
  private runner: Runner;

  async init() {
    this.runner = await getRunner(Const_dbname);
  }

  async getPricesFromDay(dayNum: number): Promise<any[]> {
    return await this.runner.tableFromProc('getPricesFromDay', [dayNum]);
  }

  async getTradDays(begin: number, end: number) {
    try {
      let sqlStr = `select \`day\`, \`dayno\`, \`year\`, \`seasonno\`, \`monthno\` 
      from t_dayindex where \`day\`>=${begin} and \`day\`<=${end}`;
      let ret = await this.runner.sql(sqlStr, []);
      if (Array.isArray(ret)) {
        return ret as any[];
      }
    }
    catch (e) {
      let a = e;
    }
    return [];
  }

  async getStockDivInfo(stockID: number, day: number) {
    let retDiv = await this.runner.call('tv_getstockdivinfoatday', [stockID, day]);
    if (Array.isArray(retDiv) && retDiv.length > 0) {
      let item = retDiv[0] as { s: number, p: number, price: number, bonus: number };
      return item;
    }

    return undefined;
  }

  async initTypeID(name: string, dayBegin: number, dayEnd: number): Promise<any> {
    let qr = await this.runner.call('tv_emulatetype$save', [undefined, name, dayBegin, dayEnd]);
    let arr = qr as any[];
    if (arr.length > 0) {
      let r = arr[0];
      await this.runner.call('tv_emulatetype$deletedata', [r.id]);
      return r.id;
    }

    return undefined;
  }

  async SaveStatus(typeID: number, date:number, money: number, share: number, gain: number) {
    await this.runner.call('tv_emulateresult$save', [typeID, date, money, share, gain]);
  }

  async SaveDetail(typeID:number, day:number, detail: string) {
    await this.runner.call('tv_emulateshares$save', [typeID, day, detail]);
  }

  async SaveTrade(p: EmulateTrade) {
    await this.runner.call('tv_emulatetrade$add', [p.type, p.day, p.stock, p.tradeType, p.price, p.volume]);
  }

  async LoadROE_PE_Dividend_Rank(day: number, count: number) {
    return await this.runner.call('tv_calcmagicorderdpr', [day, count]) as {stock:number, no:number, pe:number, roe:number, dv: number, ma:number}[];
  }

  async LoadROE_PE_Magic_Rank(day: number, count: number) {
    return await this.runner.call('tv_calcmagicorder2', [day, count]) as {stock:number, no:number, pe:number, roe:number, ma:number}[];
  }

  async LoadROE_PE_Magic_CheckE_Rank(day: number, count: number) {
    return await this.runner.call('tv_calcmagicorder3', [day, count]) as {stock:number, no:number, pe:number, roe:number, ma:number}[];
  }
}

export const data = new Data();

