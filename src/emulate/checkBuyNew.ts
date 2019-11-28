import { Runner } from '../db';
import {EmulateTrades} from "./emulate61"
import { TradeDay, initTradeDay, getTradeDayAt, getNextTradeDay, getLastTradeDay } from "./tradeday";
import { EmulateTrade, EmulateResult, EmulateShare, EmulateStockResultItem, SelectStockResultItem, EmulateDetail, EmulateShareItem } from './emulate';

export async function checkBuyNew(et:EmulateTrades) {
  if (et.weekBuyCount >= et.maxWeekBuyCount || et.emuDetails.moneyCount <= 0)
    return;
  let lastDay = getLastTradeDay(et.currentTradeDay.day);
  let ret = await et.runner.call('tv_calcmagicorderdpr', [lastDay, 100]);
  if (!CheckAllPE(ret))
    return;
  
  let length = ret.length as number;
  let i = 0;
  for (; i < length; ++i) {
    let item = ret[i] as {stock: number, pe: number};
    if (item.pe >= 12)
      continue;
    let fi = et.emuDetails.shares.findIndex(v=>v.stock === item.stock);
    if (fi >= 0) {
      let r = await CheckBuyExist(et, et.emuDetails.shares[i]);
      if (r)
        return;
      continue;
    }
    let retPrice = await et.runner.call('tv_getstockpriceatday', [item.stock, et.currentTradeDay.day]) as any[];
    if (retPrice.length <= 0)
      continue;
    let price = retPrice[0].price;
    let money = et.emuDetails.money / et.emuDetails.moneyCount;
    let volume = Math.floor((money / (price*1.002)) / 100) * 100;
    if (volume <= 0)
      continue;
    let r = await et.AddNewStock(item.stock, volume, price);
    if (r)
      break;
  }
}

function CheckAllPE(stockSelected:any[]) : boolean {
  if (stockSelected.length < 50)
    return false;
  let sum = 0;
  for (let i = 0; i < 50; ++i) {
    sum += stockSelected[i].pe;
  }
  let peAvg = sum / 50;
  if (peAvg >= 25)
    return false;
  return true;
}

async function CheckBuyExist(et:EmulateTrades, share:EmulateShare) {
  let items = share.items;
  let length = items.length;
  if (length >= 3)
    return false;
  let i = 0;
  let dayno = et.currentTradeDay.dayno;
  for (; i < length; ++i) {
    let oi = items[i];
    let oday = getTradeDayAt(oi.buyDay);
    if (oday === undefined)
      continue;
    if (dayno - oday.dayno < 10)
      return false;
  }

  let stock = share.stock;
  let price = items[0].price;
  let money = et.emuDetails.money / et.emuDetails.moneyCount;
  let volume = Math.floor((money / (price*1.002)) / 100) * 100;
  let nbItem: EmulateShareItem = {
    buyDay: et.currentTradeDay.day,
    count: 1,
    level: 1,
    volume: volume,
    costprice: price,
    price: price
  }
  await et.buyShareItem(stock, nbItem);
  et.weekBuyCount++;
  share.items.push(nbItem);

  return true;
}