import { Runner } from '../db';
import {EmulateTrades} from "./emulate61"
import { TradeDay, initTradeDay, getTradeDayAt, getNextTradeDay } from "./tradeday";
import { EmulateTrade, EmulateResult, EmulateShare, EmulateStockResultItem, SelectStockResultItem, EmulateDetail, EmulateShareItem } from './emulate';

export async function checkOld(et:EmulateTrades) {
  let shares = et.emuDetails.shares;
  for (let i = 0; i < shares.length; ++i) {
    await updateOne(et, shares[i]);
  }
}

async function updateOne(et:EmulateTrades, share:EmulateShare) {
  if (share.items.length <= 0)
    return;
  let stock = share.stock;
  
  let rItems = share.items;
  let eItemArr: EmulateShareItem[] = [];
  let i:number;
  let maxLevel = 1;
  let haveLevel:boolean[] = [false, false, false, false, false, false, false];
  rItems.forEach(v=>{
    haveLevel[v.level] = true;
    if (v.level > maxLevel)
      maxLevel = v.level;
  });
  for (i = 0; i < rItems.length; ++i) {
    let item = rItems[i];
    if (item.level === 1) {
      let zf = item.price / item.costprice;
      eItemArr.push(item);
      if (zf <= 0.9 && !haveLevel[2] && et.emuDetails.moneyCount >= 1 && et.weekBuyCount < 3) {
        let price = item.price;
        let money = et.emuDetails.money / et.emuDetails.moneyCount;
        let volume = Math.floor((money / (price*1.002)) / 100) * 100;
        if (volume > 0) {
          let nbItem: EmulateShareItem = {
            buyDay: et.currentTradeDay.day,
            count: 1,
            level: 2,
            volume: volume,
            costprice: item.price,
            price: item.price
          }
          await et.buyShareItem(stock, nbItem);
          et.weekBuyCount++;
          eItemArr.push(nbItem);
          share.count += nbItem.count;
        }
      }
    }
    else if (item.level === 2) {
      let zf = item.price / item.costprice;
      if (zf <= 0.9 && maxLevel <= 2 && et.emuDetails.moneyCount >= 1 && et.weekBuyCount < 3) {
        eItemArr.push(item);
        let price = item.price;
        let money = et.emuDetails.money / et.emuDetails.moneyCount;
        let volume = Math.floor((money / (price*1.002)) / 100) * 100;
        if (volume > 0) {
          let nbItem: EmulateShareItem = {
            buyDay: et.currentTradeDay.day,
            count: 1,
            level: 3,
            volume: volume,
            costprice: item.price,
            price: item.price
          }
          await et.buyShareItem(stock, nbItem);
          et.weekBuyCount++;
          eItemArr.push(nbItem);
          share.count += nbItem.count;
        }
      }
      else if (zf >= 1.1) {
        et.sellShareItem(stock, item);
        share.count -= item.count;
      }
      else {
        eItemArr.push(item);
      }
    }
    else if (item.level === 3) {
      let zf = item.price / item.costprice;
      eItemArr.push(item);
      if (zf <= 0.9 && !haveLevel[4] && et.emuDetails.moneyCount >= 1 && et.weekBuyCount < 3) {
        let price = item.price;
        let money = et.emuDetails.money / et.emuDetails.moneyCount;
        let volume = Math.floor((money / (price*1.002)) / 100) * 100;
        if (volume > 0) {
          let nbItem: EmulateShareItem = {
            buyDay: et.currentTradeDay.day,
            count: 1,
            level: 4,
            volume: volume,
            costprice: item.price,
            price: item.price
          }
          await et.buyShareItem(stock, nbItem);
          et.weekBuyCount++;
          eItemArr.push(nbItem);
          share.count += nbItem.count;
        }
      }
    }
    else if (item.level === 4) {
      let zf = item.price / item.costprice;
      if (zf <= 0.9 && maxLevel <= 4 && et.emuDetails.moneyCount >= 1 && et.weekBuyCount < 3) {
        eItemArr.push(item);
        let price = item.price;
        let money = et.emuDetails.money / et.emuDetails.moneyCount;
        let volume = Math.floor((money / (price*1.002)) / 100) * 100;
        if (volume > 0) {
          let nbItem: EmulateShareItem = {
            buyDay: et.currentTradeDay.day,
            count: 1,
            level: 5,
            volume: volume,
            costprice: item.price,
            price: item.price
          }
          await et.buyShareItem(stock, nbItem);
          et.weekBuyCount++;
          eItemArr.push(nbItem);
          share.count += nbItem.count;
        }
      }
      else if (zf >= 1.1) {
        et.sellShareItem(stock, item);
        share.count -= item.count;
      }
      else {
        eItemArr.push(item);
      }
    }
    else if (item.level === 5) {
      let zf = item.price / item.costprice;
      eItemArr.push(item);
      if (zf <= 0.9 && maxLevel <= 5 && et.emuDetails.moneyCount >= 1 && et.weekBuyCount < 3) {
        let price = item.price;
        let money = et.emuDetails.money / et.emuDetails.moneyCount;
        let volume = Math.floor((money / (price*1.002)) / 100) * 100;
        if (volume > 0) {
          let nbItem: EmulateShareItem = {
            buyDay: et.currentTradeDay.day,
            count: 1,
            level: 6,
            volume: volume,
            costprice: item.price,
            price: item.price
          }
          await et.buyShareItem(stock, nbItem);
          et.weekBuyCount++;
          eItemArr.push(nbItem);
          share.count += nbItem.count;
        }
      }
    }
    else if (item.level === 6) {
      if (item.price / item.costprice >= 1.1) {
        et.sellShareItem(stock, item);
        share.count -= item.count;
      }
      else {
        eItemArr.push(item);
      }     
    }
  }
  share.items = eItemArr;
}