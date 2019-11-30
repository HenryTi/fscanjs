"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tradeday_1 = require("./tradeday");
async function checkBuyNew(et) {
    if (et.weekChangeCount >= et.maxWeekChangeCount || et.emuDetails.moneyCount <= 10)
        return;
    let lastDay = tradeday_1.getLastTradeDay(et.currentTradeDay.day);
    let ret = await et.runner.call('tv_calcmagicorderdpr', [lastDay, 100]);
    if (!CheckAllPE(ret))
        return;
    let length = ret.length;
    let i = 0;
    for (; i < length; ++i) {
        let item = ret[i];
        if (item.pe > 10)
            continue;
        let fi = et.emuDetails.shares.findIndex(v => v.stock === item.stock);
        if (fi >= 0) {
            //let r = await CheckBuyExist(et, et.emuDetails.shares[fi]);
            //if (r)
            return;
            continue;
        }
        let retPrice = await et.runner.call('tv_getstockpriceatday', [item.stock, et.currentTradeDay.day]);
        if (retPrice.length <= 0)
            continue;
        let price = retPrice[0].price;
        let money = et.emuDetails.money / et.emuDetails.moneyCount;
        let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
        if (volume <= 0)
            continue;
        let r = await et.AddNewStock(item.stock, volume, price);
        if (r)
            break;
    }
}
exports.checkBuyNew = checkBuyNew;
function CheckAllPE(stockSelected) {
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
async function CheckBuyExist(et, share) {
    let items;
    items = share.items;
    let length = items.length;
    if (length >= 3)
        return false;
    let i = 0;
    let dayno = et.currentTradeDay.dayno;
    for (; i < length; ++i) {
        let oi = items[i];
        let oday = tradeday_1.getTradeDayAt(oi.buyDay);
        if (oday === undefined)
            continue;
        if (dayno - oday.dayno < 10)
            return false;
    }
    let stock = share.stock;
    let price = items[0].price;
    let money = et.emuDetails.money / et.emuDetails.moneyCount;
    let volume = Math.floor((money / (price * 1.002)) / 100) * 100;
    let nbItem = {
        buyDay: et.currentTradeDay.day,
        count: 1,
        level: 1,
        volume: volume,
        costprice: price,
        price: price
    };
    await et.buyShareItem(stock, nbItem);
    et.weekChangeCount++;
    share.items.push(nbItem);
    return true;
}
//# sourceMappingURL=checkBuyNew.js.map