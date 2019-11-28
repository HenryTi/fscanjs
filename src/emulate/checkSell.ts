import { Runner } from '../db';
import {EmulateTrades} from "./emulate61"
import { TradeDay, initTradeDay, getTradeDayAt, getNextTradeDay } from "./tradeday";
import { EmulateTrade, EmulateResult, EmulateShare, EmulateStockResultItem, SelectStockResultItem, EmulateDetail, EmulateShareItem } from './emulate';

export async function checkSell(et:EmulateTrades, pelist:any[]) {
  let shares = et.emuDetails.shares;
  let sellCount = 0;
  let sellAllStocks = [];
  let i = 0;
  for (; i < shares.length; ++i) {
    let si = shares[i];
    let index = pelist.findIndex(v=>v.stock===si.stock);
    let pe: number = undefined;
    if (index >= 0)
      pe = pelist[index].pe;
    if (pe < 0 || pe >= 30) {
      let item = si.items[0];
      //if (item.price >= item.costprice) {
      //  sellAllStocks.push(si.stock);
      //}
    }
  }
  
  for (i = 0; i < sellAllStocks.length; ++i) {
    await et.removeStock(sellAllStocks[i]);
  }
}