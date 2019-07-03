import * as _ from 'lodash';
import { getRunner, Runner } from '../db';
import { sleep, checkToDateInt, checkNumberNaNToZero, RemoteIsRun, RemoteRun } from '../gfuncs';
import { Const_dbname } from '../const';
import { EmulateTrade, EmulateResult, EmulateShare, EmulateStockResultItem, SelectStockResultItem } from './emulate';

const GroupSize = 30;
const cont_amountInit = 3000000;
const const_EmulatePlanName = '一直持股';

export async function emulateTrade() {
  if (RemoteIsRun())
    return;
  RemoteRun(true);
  try {
    let runner: Runner = await getRunner(Const_dbname);

    let param = { yearBegin: 0, monthBegin: 1, yearEnd: 2019, monthEnd: 6 };

    for (let year = 2001; year < 2019; ++year) {
      for (let month = 1; month <= 12; month += 3) {
        let em = new EmulateTrades(runner);
        param.yearBegin = year;
        param.monthBegin = month;
        await em.processOne(param);
        console.log('emulate: ' + year + ' - ' + month);
      }
    }
  }
  catch (err) {
    console.log(err);
  }
  RemoteRun(false);
}

function dayFromYearMonth(year: number, month: number) {
  return year * 10000 + month * 100 + 1;
}

class EmulateTrades {
  private runner: Runner;
  private typeID: number;
  private typeBeginDay: number;
  private emuShares: EmulateShare[];
  private emuReulst: EmulateResult;
  private amountInit: number;

  constructor(runner: Runner) {
    this.runner = runner;
    this.emuShares = [];
    this.amountInit = cont_amountInit;
  }

  private async initTypeID(dayBegin: number): Promise<any> {
    let qr = await this.runner.query('tv_emulatetype$getid', [const_EmulatePlanName, dayBegin]);
    let arr = qr as any[];
    if (arr.length > 0) {
      let r = arr[0];
      this.typeID = r.id;
      this.typeBeginDay = dayBegin;
      return r;
    }

    qr = await this.runner.call('tv_emulateType$save', [undefined, const_EmulatePlanName, dayBegin]);
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
    return ret;
  }

  async processOne(p: { yearBegin: number, monthBegin: number, yearEnd: number, monthEnd: number }): Promise<any> {
    try {
      let dayBegin = dayFromYearMonth(p.yearBegin, p.monthBegin);
      let dayEnd = dayFromYearMonth(p.yearEnd, p.monthEnd);
      let type = await this.initTypeID(dayBegin);
      if (type === undefined)
        throw 'cant get emulatetypeid :' + p;
      await this.runner.call('tv_emulatetype$deletedata', [this.typeID]);
      await this.CalculateFirst(p.yearBegin, p.monthBegin);
      let mb = p.monthBegin + 1;
      for (let y = p.yearBegin; y <= p.yearEnd; ++y) {
        for (let m = mb; y == p.yearEnd ? m <= p.monthEnd : m <= 12; ++m) {
          await this.CalculateNext(y, m);
        }
        mb = 1;
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  protected async CalculateFirst(year: number, month: number) {
    let dayBegin = dayFromYearMonth(year, month);
    let arr = await this.SelectStocks(dayBegin);

    let shares: EmulateShare[] = [];
    let tcount = 0;
    let i: number;
    let amountOne = this.amountInit / 30;
    let amountSum = 0;
    let emuTrades: EmulateTrade[] = [];

    for (i = 0; i < arr.length; ++i) {
      let item = arr[i];
      let pi: { price: number, day: number } = await this.GetStockNextPrice(item.stock, dayBegin);
      if (pi === undefined || pi.day > dayBegin + 15) {
        continue;
      }
      let volume = Math.floor(amountOne / pi.price / 100) * 100;
      let s: EmulateShare = { type: this.typeID, day: dayBegin, stock: item.stock, price: pi.price, volume: volume };
      amountSum += volume * pi.price;
      shares.push(s);
      emuTrades.push({ type: this.typeID, day: dayBegin, stock: item.stock, tradeType: 1, price: pi.price, volume: volume });
      ++tcount;
      if (tcount >= 30)
        break;
    }

    this.emuShares = shares;
    this.emuReulst = { type: this.typeID, day: dayBegin, money: this.amountInit - amountSum, share: amountSum, gain: 1 };
    await this.SaveTrades(emuTrades);
    await this.SaveCurrentStatus();
  }

  protected async CalculateNext(year: number, month: number) {
    let dayEnd = dayFromYearMonth(year, month);
    let shares: EmulateShare[] = [];
    let i = 0;
    let amoutShares = 0;
    let bonus = 0;
    for (; i < this.emuShares.length; ++i) {
      let si = this.emuShares[i];
      let ci = await this.GetOneStockResult(si.stock, si.day, dayEnd);
      let s = _.clone(si);
      s.day = dayEnd;
      if (ci === undefined) {
        let li = await this.GetStockLastPrice(si.stock, dayEnd);
        if (li !== undefined) {
          s.price = li.price;
        }
      }
      else {
        let b = 0;
        if (ci.bonus > 0) {
          b = si.volume * ci.bonus;
        }
        if (ci.rate !== 1) {
          s.volume = s.volume * ci.rate;
        }
        s.price = ci.priceEnd;
        if (b > 0) {
          let v = Math.floor(b / s.price / 100) * 100;
          let m = v * s.price;
          s.volume += v;
          bonus += b - m;
        }
      }
      shares.push(s);
      amoutShares += s.price * s.volume;
    }

    let er = _.clone(this.emuReulst);
    er.day = dayEnd;
    er.money += bonus;
    er.share = amoutShares;
    er.gain = (er.money + er.share) / this.amountInit;
    this.emuShares = shares;
    this.emuReulst = er;
    await this.SaveCurrentStatus();
  }

  protected async SaveCurrentStatus() {
    let i = 0;
    for (; i < this.emuShares.length; ++i) {
      let ei = this.emuShares[i];
      await this.runner.call('tv_emulateshares$save', [ei.type, ei.day, ei.stock, ei.price, ei.volume]);
    }

    await this.runner.call('tv_emulateresult$save', [this.emuReulst.type, this.emuReulst.day, this.emuReulst.money, this.emuReulst.share, this.emuReulst.gain]);
  }

  protected async SaveTrades(p: EmulateTrade[]) {
    for (let i = 0; i < p.length; ++i) {
      let ti = p[i];
      await this.runner.call('tv_emulatetrade$save', [ti.type, ti.day, ti.stock, ti.tradeType, ti.price, ti.volume]);
    }
  }

  protected async SelectStocks(dayBegin: number) {
    await this.runner.call('tv_calcemulateyzcg', [dayBegin]);
    let ret = await this.runner.query('tv_getyzcgorderresult', [200]);
    let arr = ret as any[];

    let shares: SelectStockResultItem[] = [];
    let i = 0;
    for (; i < arr.length; ++i) {
      let item = arr[i];
      let { stock, order, pe, roe } = item as { stock: number, order: number, pe: number, roe: number };
      let r: SelectStockResultItem = { stock: stock, order: order, pe: pe, roe: roe };
      shares.push(r);
    }
    return shares;
  }

  protected async GetOneStockResult(stock: number, dayBegin: number, dayEnd: number): Promise<EmulateStockResultItem> {
    let ret = await this.runner.query('tv_getStockRestoreShare', [stock, dayBegin, dayEnd]);
    if (ret.length <= 0)
      return undefined;
    let { priceBegin, bday, priceEnd, eday, rate, bonus } = ret[0] as { priceBegin: number, bday: number, priceEnd: number, eday: number, rate: number, bonus: number };
    return {
      stock: stock,
      priceBegin: priceBegin,
      dayBegin: bday,
      priceEnd: priceEnd,
      dayEnd: eday,
      rate: rate,
      bonus: bonus
    };
  }

  protected async GetStockNextPrice(stock: number, day: number) {
    let ret = await this.runner.query('tv_getstockpriceafterday', [stock, day]);
    if (ret.length <= 0)
      return undefined;
    let item: { price: number, day: number } = ret[0];
    return { price: item.price, day: item.day };
  }

  protected async GetStockLastPrice(stock: number, day: number) {
    let ret = await this.runner.query('tv_getstocklastprice', [stock, day]);
    if (ret.length <= 0)
      return undefined;
    let item: { price: number, day: number } = ret[0];
    return { price: item.price, day: item.day };
  }
}
